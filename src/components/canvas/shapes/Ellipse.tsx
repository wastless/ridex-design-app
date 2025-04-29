"use client";

/**
 * Компонент для отображения эллипса на холсте
 * Поддерживает настройку цвета заливки, обводки и прозрачности
 */

import React from "react";
import { CanvasMode, type EllipseLayer } from "~/types";
import { colorToCss } from "~/utils";
import { useCanvas } from "../helper/CanvasContext";

type EllipseProps = {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  canvasMode: CanvasMode;
};

export default function Ellipse({
  id,
  layer,
  onPointerDown,
  canvasMode,
}: EllipseProps) {
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

  // Вычисляем центр и радиусы эллипса
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radiusX = width / 2;
  const radiusY = height / 2;

  return (
    <g className="group">
      {/* Контур эллипса при выделении или наведении */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={radiusX}
        ry={radiusY}
        fill="none"
        stroke="#4183ff"
        strokeWidth={outlineStrokeWidth}
        className={outlineClass}
      />

      {/* Основная фигура эллипса */}
      <ellipse
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          mixBlendMode:
            (blendMode as React.CSSProperties["mixBlendMode"]) ?? "normal",
          opacity: `${opacity ?? 100}%`,
        }}
        cx={centerX}
        cy={centerY}
        rx={radiusX}
        ry={radiusY}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={scaledStrokeWidth}
      />
    </g>
  );
}
