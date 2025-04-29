"use client";

/**
 * Компонент для отображения рамки выделения вокруг текстовых элементов на холсте.
 * Специализированная версия SelectionBox для работы с текстовыми слоями,
 * учитывающая особенности их отображения и редактирования.
 */

import { useSelf, useStorage } from "@liveblocks/react";
import { memo, useEffect, useRef, useState, useMemo } from "react";
import { Side, type XYWH, type TextLayer } from "~/types";
import { useCanvas } from "./helper/CanvasContext";

/**
 * Константы для стилизации элементов выделения
 */
const handleWidth = 8; // Размер маркеров изменения размера
const handleEdgeWidth = 4; // Ширина областей для изменения размера

/**
 * Интерфейс пропсов компонента TextSelectionBox
 */
interface TextSelectionBoxProps {
  /** Обработчик начала изменения размера */
  onResizeHandlePointerDown: (side: Side, initialBounds: XYWH) => void;
  /** Флаг состояния редактирования текста */
  isEditing: boolean;
}

/**
 * Компонент для отображения рамки выделения вокруг текстовых элементов
 */
const TextSelectionBox = memo(
  ({ onResizeHandlePointerDown, isEditing }: TextSelectionBoxProps) => {
    // Получаем ID единственного выделенного элемента (если он один)
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null,
    );

    // Получаем текстовый слой и приводим его к нужному типу
    const layer = useStorage((root) =>
      soleLayerId ? (root.layers.get(soleLayerId) as TextLayer) : null,
    );

    // Получаем текущее состояние камеры из контекста
    const { camera } = useCanvas();

    // Флаг, определяющий показ маркеров изменения размера
    const isShowingHandles = !isEditing && layer;

    // Используем реальные размеры текстового контейнера вместо bounds
    const textBounds = useMemo(() => 
      layer
        ? {
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
          }
        : null,
      [layer]
    );

    // Ссылка для измерения ширины текста
    const textRef = useRef<SVGTextElement>(null);
    const [textWidth, setTextWidth] = useState(0);
    const padding = 8;

    // Масштабирование элементов с учетом зума
    const scaledHandleWidth = handleWidth / camera.zoom;
    const scaledHandleEdgeWidth = handleEdgeWidth / camera.zoom;
    const scaledPadding = padding / camera.zoom;
    const fontSize = 14 / camera.zoom; // Масштабирование размера шрифта

    // Обновляем ширину текста при изменении границ текстового элемента
    useEffect(() => {
      if (textRef.current) {
        const bbox = textRef.current.getBBox();
        setTextWidth(bbox.width);
      }
    }, [textBounds]);

    // Не рендерим ничего, если нет данных о границах или текстовом слое
    if (!textBounds || !layer) return null;

    return (
      <>
        {/* Основная рамка выделения */}
        <rect
          style={{
            transform: `translate(${textBounds.x}px, ${textBounds.y}px)`,
          }}
          className="pointer-events-none fill-transparent"
          width={textBounds.width}
          height={textBounds.height}
          stroke="#4183ff"
          strokeWidth={2 / camera.zoom}
        />

        {/* Отображение размеров текста */}
        {!isEditing && (
          <>
            {/* Фон для отображения размеров */}
            <rect
              className="fill-primary-light"
              x={
                textBounds.x +
                textBounds.width / 2 -
                (textWidth + scaledPadding) / 2
              }
              y={textBounds.y + textBounds.height + 10 / camera.zoom}
              width={textWidth + scaledPadding}
              height={20 / camera.zoom}
              rx={4 / camera.zoom}
            />

            {/* Текст с размерами */}
            <text
              ref={textRef}
              style={{
                transform: `translate(${textBounds.x + textBounds.width / 2}px, ${textBounds.y + textBounds.height + 25 / camera.zoom}px)`,
                fontSize: `${fontSize}px`,
              }}
              textAnchor="middle"
              className="pointer-events-none select-none fill-text-white-0 font-normal"
            >
              {Math.round(textBounds.width)} × {Math.round(textBounds.height)}
            </text>
          </>
        )}

        {/* Маркеры и области для изменения размера */}
        {isShowingHandles && (
          <>
            {/* Область для изменения размера слева */}
            <rect
              style={{
                cursor: "ew-resize",
                width: `${scaledHandleEdgeWidth}px`,
                height: `${textBounds.height}px`,
                transform: `translate(${textBounds.x - scaledHandleEdgeWidth / 2}px, ${textBounds.y}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Left, textBounds);
              }}
            />

            {/* Область для изменения размера справа */}
            <rect
              style={{
                cursor: "ew-resize",
                width: `${scaledHandleEdgeWidth}px`,
                height: `${textBounds.height}px`,
                transform: `translate(${textBounds.x + textBounds.width - scaledHandleEdgeWidth / 2}px, ${textBounds.y}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Right, textBounds);
              }}
            />

            {/* Область для изменения размера сверху */}
            <rect
              style={{
                cursor: "ns-resize",
                width: `${textBounds.width}px`,
                height: `${scaledHandleEdgeWidth}px`,
                transform: `translate(${textBounds.x}px, ${textBounds.y - scaledHandleEdgeWidth / 2}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top, textBounds);
              }}
            />

            {/* Область для изменения размера снизу */}
            <rect
              style={{
                cursor: "ns-resize",
                width: `${textBounds.width}px`,
                height: `${scaledHandleEdgeWidth}px`,
                transform: `translate(${textBounds.x}px, ${textBounds.y + textBounds.height - scaledHandleEdgeWidth / 2}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom, textBounds);
              }}
            />

            {/* Маркеры углов */}
            {/* Маркер левого верхнего угла */}
            <rect
              style={{
                cursor: "nwse-resize",
                width: `${scaledHandleWidth}px`,
                height: `${scaledHandleWidth}px`,
                transform: `translate(${textBounds.x - scaledHandleWidth / 2}px, ${textBounds.y - scaledHandleWidth / 2}px)`,
                fill: "white",
                stroke: "#4183ff",
                strokeWidth: `${1 / camera.zoom}px`,
              }}
              className="fill-white"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Left, textBounds);
              }}
            />

            {/* Маркер правого верхнего угла */}
            <rect
              style={{
                cursor: "nesw-resize",
                width: `${scaledHandleWidth}px`,
                height: `${scaledHandleWidth}px`,
                transform: `translate(${textBounds.x + textBounds.width - scaledHandleWidth / 2}px, ${textBounds.y - scaledHandleWidth / 2}px)`,
                fill: "white",
                stroke: "#4183ff",
                strokeWidth: `${1 / camera.zoom}px`,
              }}
              className="fill-white"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Right, textBounds);
              }}
            />

            {/* Маркер левого нижнего угла */}
            <rect
              style={{
                cursor: "nesw-resize",
                width: `${scaledHandleWidth}px`,
                height: `${scaledHandleWidth}px`,
                transform: `translate(${textBounds.x - scaledHandleWidth / 2}px, ${textBounds.y + textBounds.height - scaledHandleWidth / 2}px)`,
                fill: "white",
                stroke: "#4183ff",
                strokeWidth: `${1 / camera.zoom}px`,
              }}
              className="fill-white"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Left, textBounds);
              }}
            />

            {/* Маркер правого нижнего угла */}
            <rect
              style={{
                cursor: "nwse-resize",
                width: `${scaledHandleWidth}px`,
                height: `${scaledHandleWidth}px`,
                transform: `translate(${textBounds.x + textBounds.width - scaledHandleWidth / 2}px, ${textBounds.y + textBounds.height - scaledHandleWidth / 2}px)`,
                fill: "white",
                stroke: "#4183ff",
                strokeWidth: `${1 / camera.zoom}px`,
              }}
              className="fill-white"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Right, textBounds);
              }}
            />
          </>
        )}
      </>
    );
  },
);

// Задаем displayName для отладки в React DevTools
TextSelectionBox.displayName = "TextSelectionBox";

export default TextSelectionBox;
