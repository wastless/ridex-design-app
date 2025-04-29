"use client";

/**
 * Компонент для отображения прямоугольника на холсте
 * Поддерживает настройку цвета заливки, обводки, прозрачности и скругления углов
 */

import React from "react";
import { CanvasMode, type RectangleLayer } from "~/types";
import { colorToCss } from "~/utils";
import { useCanvas } from "../helper/CanvasContext";

type RectangleProps = {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  canvasMode: CanvasMode;
};

export default function Rectangle({
  id,
  layer,
  onPointerDown,
  canvasMode,
}: RectangleProps) {
  // Получаем camera для масштабирования обводки
  const { camera } = useCanvas();

  // Деструктуризация свойств из объекта слоя
  const {
    x,
    y,
    width,
    height,
    fill,
    stroke,
    opacity,
    cornerRadius,
    blendMode,
    strokeWidth,
  } = layer;

  // Получаем CSS-представление цветов с учетом их непрозрачности
  const fillColor = fill ? colorToCss(fill) : "none";
  const strokeColor = stroke ? colorToCss(stroke) : "none";

  // Толщина обводки с учетом масштаба
  const scaledStrokeWidth = stroke ? (strokeWidth ?? 1) / camera.zoom : 0;
  // Толщина обводки для выделения/наведения
  const outlineStrokeWidth = 3 / camera.zoom;

  // Определяем классы для контура при наведении и выделении
  const outlineClass = [
    CanvasMode.None,
    CanvasMode.RightClick,
    CanvasMode.SelectionNet,
    CanvasMode.Translating,
    CanvasMode.Pressing,
  ].includes(canvasMode)
    ? "pointer-events-none opacity-0 group-hover:opacity-100"
    : "pointer-events-none opacity-0";

  return (
    <g className="group">
      {/* Контур прямоугольника при выделении или наведении */}
      <rect
        style={{ transform: `translate(${x}px, ${y}px)` }}
        width={width}
        height={height}
        fill="none"
        stroke="#4183ff"
        strokeWidth={outlineStrokeWidth}
        className={outlineClass}
        rx={cornerRadius ?? 0}
        ry={cornerRadius ?? 0}
      />

      {/* Фигура прямоугольника */}
      <rect
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          mixBlendMode:
            (blendMode as React.CSSProperties["mixBlendMode"]) ?? "normal",
          opacity: `${opacity ?? 100}%`,
        }}
        width={width}
        height={height}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={scaledStrokeWidth}
        rx={cornerRadius ?? 0}
        ry={cornerRadius ?? 0}
      />
    </g>
  );
}
