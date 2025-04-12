/*** Рендеринг эллипса ***/

import {CanvasMode, type EllipseLayer} from "~/types";
import { colorToCss } from "~/utils";
import React from "react";

export default function Ellipse({
  id,
  layer,
  onPointerDown,
    canvasMode,
}: {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
    canvasMode: CanvasMode;
}) {
  // Деструктуризация свойств из объекта слоя
  const { x, y, width, height, fill, stroke, opacity, blendMode } = layer;

  // Получаем CSS-представление цветов с учетом их непрозрачности
  const fillColor = fill ? colorToCss(fill) : "#CCC";
  const strokeColor = stroke ? colorToCss(stroke) : "#CCC";

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
      {/* Контур эллипса при выделении */}
      <ellipse
        style={{ transform: `translate(${x}px, ${y}px)` }}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        fill="none"
        stroke="#4183ff"
        strokeWidth="3"
        className={outlineClass}
      />

      {/* Фигура эллипса */}
      <ellipse
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ 
          transform: `translate(${x}px, ${y}px)`,
          mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'] || 'normal',
          opacity: `${opacity ?? 100}%`
        }}
        fill={fillColor}
        stroke={strokeColor}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        strokeWidth="1"
      />
    </g>
  );
}
