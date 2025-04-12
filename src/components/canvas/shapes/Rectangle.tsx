/*** Рендеринг прямоугольника ***/

import {CanvasMode, type RectangleLayer} from "~/types";
import { colorToCss } from "~/utils";
import React from "react";

export default function Rectangle({
  id,
  layer,
  onPointerDown,
  canvasMode,
}: {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  canvasMode: CanvasMode;
}) {
  // Деструктуризация свойств из объекта слоя
  const { x, y, width, height, fill, stroke, opacity, cornerRadius, blendMode } = layer;

  // Получаем CSS-представление цветов с учетом их непрозрачности
  const fillColor = fill ? colorToCss(fill) : 'none';
  const strokeColor = stroke ? colorToCss(stroke) : 'none';

  const outlineClass = [
    CanvasMode.None,
    CanvasMode.RightClick,
    CanvasMode.SelectionNet,
    CanvasMode.Translating,
    CanvasMode.Pressing
  ].includes(canvasMode)
    ? "pointer-events-none opacity-0 group-hover:opacity-100"
    : "pointer-events-none opacity-0";

  return (
    <g className="group">
      {/* Контур прямоугольника при выделении */}
      <rect
        style={{ transform: `translate(${x}px, ${y}px)` }}
        width={width}
        height={height}
        fill="none"
        stroke="#4183ff"
        strokeWidth="3"
        className={outlineClass}
      />

      {/* Фигура прямоугольника */}
      <rect
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ 
          transform: `translate(${x}px, ${y}px)`,
          mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'] || 'normal',
          opacity: `${opacity ?? 100}%`,
        }}
        width={width}
        height={height}
        fill={fillColor}
        stroke={strokeColor}
        rx={cornerRadius ?? 0}
        ry={cornerRadius ?? 0}
      />
    </g>
  );
}
