"use client";

/**
 * Компонент для отображения рамки выделения вокруг элементов на холсте.
 * Включает визуализацию границ выделения, маркеров для изменения размера и
 * отображение размеров выбранного элемента. Поддерживает различные типы
 * элементов и адаптируется к масштабированию холста.
 */

import { useSelf, useStorage } from "@liveblocks/react";
import { memo, useEffect, useRef, useState } from "react";
import useSelectionBounds from "~/hooks/use-selection-bounds";
import { LayerType, Side, XYWH } from "~/types";
import TextSelectionBox from "./TextSelectionBox";
import { useCanvas } from "./helper/CanvasContext";

/**
 * Константы для стилизации элементов выделения
 */
const handleWidth = 8; // Размер маркеров изменения размера
const handleEdgeWidth = 4; // Ширина областей для изменения размера при наведении на стороны

/**
 * Интерфейс пропсов компонента SelectionBox
 */
interface SelectionBoxProps {
  /** Обработчик начала изменения размера */
  onResizeHandlePointerDown: (side: Side, initialBounds: XYWH) => void;
  /** Флаг состояния редактирования текста */
  isEditing: boolean;
}

/**
 * Компонент для отображения рамки выделения вокруг элементов на холсте
 */
const SelectionBox = memo(
  ({ onResizeHandlePointerDown, isEditing }: SelectionBoxProps) => {
    // Получаем ID единственного выделенного элемента (если он один)
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null,
    );

    // Определяем тип слоя по его ID
    const layerType = useStorage((root) =>
      soleLayerId ? root.layers.get(soleLayerId)?.type : null,
    );

    // Получаем границы выделения
    const bounds = useSelectionBounds();
    // Получаем текущее состояние камеры из контекста
    const { camera } = useCanvas();

    // Ссылка для измерения ширины текста
    const textRef = useRef<SVGTextElement>(null);
    const [textWidth, setTextWidth] = useState(0);

    // Используем фиксированные отступы, масштабированные с учетом зума
    const padding = 8 / camera.zoom; // Делим на масштаб, чтобы сохранить размер в координатах холста

    // Расчет масштабированных размеров элементов интерфейса
    const scaledHandleWidth = handleWidth / camera.zoom;
    const scaledHandleEdgeWidth = handleEdgeWidth / camera.zoom;
    const fontSize = 14 / camera.zoom; // Масштабирование размера шрифта

    // Обновляем ширину текста при изменении bounds или масштаба
    useEffect(() => {
      if (textRef.current && bounds) {
        // Измеряем реальную ширину текста
        const bbox = textRef.current.getBBox();
        setTextWidth(bbox.width);
      }
    }, [bounds, camera.zoom]);

    // Не рендерим ничего, если нет границ или ID элемента
    if (!bounds || !soleLayerId) return null;

    // Для текстового элемента используем специализированный компонент TextSelectionBox
    if (layerType === LayerType.Text) {
      return (
        <TextSelectionBox
          onResizeHandlePointerDown={onResizeHandlePointerDown}
          isEditing={isEditing}
        />
      );
    }

    // Строка с размерами для отображения
    const dimensionsText = `${Math.round(bounds.width)} × ${Math.round(bounds.height)}`;

    // Для других типов элементов рендерим стандартную рамку выделения
    return (
      <>
        {/* Основная рамка выделения */}
        <rect
          style={{
            transform: `translate(${bounds.x}px, ${bounds.y}px)`,
          }}
          className="pointer-events-none fill-transparent"
          width={bounds.width}
          height={bounds.height}
          stroke="#4183ff"
          strokeWidth={2 / camera.zoom}
        />

        {/* Отображение размеров элемента */}
        {!isEditing && (
          <>
            {/* Невидимый текст для измерения размеров */}
            <text
              ref={textRef}
              style={{
                transform: `translate(${bounds.x + bounds.width / 2}px, ${bounds.y + bounds.height + 25 / camera.zoom}px)`,
                fontSize: `${fontSize}px`,
                opacity: 0, // Невидимый текст для измерения
                pointerEvents: "none",
              }}
              textAnchor="middle"
              className="select-none fill-text-white-0 font-normal"
            >
              {dimensionsText}
            </text>

            {/* Фон для отображения размеров */}
            <rect
              className="fill-primary-light"
              x={bounds.x + bounds.width / 2 - (textWidth + padding) / 2}
              y={bounds.y + bounds.height + 10 / camera.zoom}
              width={textWidth + padding}
              height={20 / camera.zoom}
              rx={4 / camera.zoom}
            />

            {/* Видимый текст с размерами */}
            <text
              style={{
                transform: `translate(${bounds.x + bounds.width / 2}px, ${bounds.y + bounds.height + 25 / camera.zoom}px)`,
                fontSize: `${fontSize}px`,
              }}
              textAnchor="middle"
              className="pointer-events-none select-none fill-text-white-0 font-normal"
            >
              {dimensionsText}
            </text>
          </>
        )}

        {/* Маркеры и области для изменения размера */}
        {!isEditing && (
          <>
            {/* Область для изменения размера слева */}
            <rect
              style={{
                cursor: "ew-resize",
                width: `${scaledHandleEdgeWidth}px`,
                height: `${bounds.height}px`,
                transform: `translate(${bounds.x - scaledHandleEdgeWidth / 2}px, ${bounds.y}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Left, bounds);
              }}
            />

            {/* Область для изменения размера справа */}
            <rect
              style={{
                cursor: "ew-resize",
                width: `${scaledHandleEdgeWidth}px`,
                height: `${bounds.height}px`,
                transform: `translate(${bounds.x + bounds.width - scaledHandleEdgeWidth / 2}px, ${bounds.y}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Right, bounds);
              }}
            />

            {/* Область для изменения размера сверху */}
            <rect
              style={{
                cursor: "ns-resize",
                width: `${bounds.width}px`,
                height: `${scaledHandleEdgeWidth}px`,
                transform: `translate(${bounds.x}px, ${bounds.y - scaledHandleEdgeWidth / 2}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top, bounds);
              }}
            />

            {/* Область для изменения размера снизу */}
            <rect
              style={{
                cursor: "ns-resize",
                width: `${bounds.width}px`,
                height: `${scaledHandleEdgeWidth}px`,
                transform: `translate(${bounds.x}px, ${bounds.y + bounds.height - scaledHandleEdgeWidth / 2}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom, bounds);
              }}
            />

            {/* Маркер левого верхнего угла */}
            <rect
              style={{
                cursor: "nwse-resize",
                width: `${scaledHandleWidth}px`,
                height: `${scaledHandleWidth}px`,
                transform: `translate(${bounds.x - scaledHandleWidth / 2}px, ${bounds.y - scaledHandleWidth / 2}px)`,
                fill: "white",
                stroke: "#4183ff",
                strokeWidth: `${1 / camera.zoom}px`,
              }}
              className="fill-white"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Left, bounds);
              }}
            />

            {/* Маркер правого верхнего угла */}
            <rect
              style={{
                cursor: "nesw-resize",
                width: `${scaledHandleWidth}px`,
                height: `${scaledHandleWidth}px`,
                transform: `translate(${bounds.x + bounds.width - scaledHandleWidth / 2}px, ${bounds.y - scaledHandleWidth / 2}px)`,
                fill: "white",
                stroke: "#4183ff",
                strokeWidth: `${1 / camera.zoom}px`,
              }}
              className="fill-white"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Right, bounds);
              }}
            />

            {/* Маркер левого нижнего угла */}
            <rect
              style={{
                cursor: "nesw-resize",
                width: `${scaledHandleWidth}px`,
                height: `${scaledHandleWidth}px`,
                transform: `translate(${bounds.x - scaledHandleWidth / 2}px, ${bounds.y + bounds.height - scaledHandleWidth / 2}px)`,
                fill: "white",
                stroke: "#4183ff",
                strokeWidth: `${1 / camera.zoom}px`,
              }}
              className="fill-white"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Left, bounds);
              }}
            />

            {/* Маркер правого нижнего угла */}
            <rect
              style={{
                cursor: "nwse-resize",
                width: `${scaledHandleWidth}px`,
                height: `${scaledHandleWidth}px`,
                transform: `translate(${bounds.x + bounds.width - scaledHandleWidth / 2}px, ${bounds.y + bounds.height - scaledHandleWidth / 2}px)`,
                fill: "white",
                stroke: "#4183ff",
                strokeWidth: `${1 / camera.zoom}px`,
              }}
              className="fill-white"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Right, bounds);
              }}
            />
          </>
        )}
      </>
    );
  },
);

// Задаем displayName для отладки в React DevTools
SelectionBox.displayName = "SelectionBox";

export default SelectionBox;
