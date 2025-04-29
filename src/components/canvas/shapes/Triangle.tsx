"use client";

/**
 * Компонент для отображения треугольника на холсте
 * Поддерживает настройку цвета заливки, обводки и прозрачности
 */

import React from "react";
import { CanvasMode, type TriangleLayer } from "~/types";
import { colorToCss } from "~/utils";
import { useCanvas } from "../helper/CanvasContext";

type TriangleProps = {
  id: string;
  layer: TriangleLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  canvasMode: CanvasMode;
};

export default function Triangle({
  id,
  layer,
  onPointerDown,
  canvasMode,
}: TriangleProps) {
  // Получаем camera для масштабирования обводки
  const { camera } = useCanvas();

  // Деструктуризация свойств из объекта слоя
  const { x, y, width, height, fill, stroke, opacity, blendMode, strokeWidth } =
    layer;

  // Получаем CSS-представление цветов с учетом их непрозрачности
  const fillColor = fill ? colorToCss(fill) : "none";
  const strokeColor = stroke ? colorToCss(stroke) : "none";

  // Толщина обводки с учетом масштаба
  const scaledStrokeWidth = stroke ? (strokeWidth ?? 1) / camera.zoom : 0;
  // Толщина обводки для выделения/наведения
  const outlineStrokeWidth = 3 / camera.zoom;

  // Вычисляем координаты для треугольника
  // Треугольник с вершиной сверху и основанием внизу
  const points = `${x + width / 2},${y} ${x},${y + height} ${x + width},${y + height}`;

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
      {/* Контур треугольника при выделении или наведении */}
      <polygon
        points={points}
        fill="none"
        stroke="#4183ff"
        strokeWidth={outlineStrokeWidth}
        className={outlineClass}
      />

      {/* Основная фигура треугольника */}
      <polygon
        onPointerDown={(e) => onPointerDown(e, id)}
        points={points}
        style={{
          mixBlendMode:
            (blendMode as React.CSSProperties["mixBlendMode"]) || "normal",
          opacity: `${opacity ?? 100}%`,
        }}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={scaledStrokeWidth}
      />
    </g>
  );
}
