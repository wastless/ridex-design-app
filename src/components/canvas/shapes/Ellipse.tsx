/*** Рендеринг эллипса ***/

import {CanvasMode, EllipseLayer} from "~/types";
import { colorToCss } from "~/utils";

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
  const { x, y, width, height, fill, stroke, opacity } = layer;

    const outlineClass = canvasMode === CanvasMode.Translating
        ? "pointer-events-none opacity-0"
        : "pointer-events-none opacity-0 group-hover:opacity-100";

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
        style={{ transform: `translate(${x}px, ${y}px)` }}
        fill={fill ? colorToCss(fill) : "#CCC"}
        stroke={stroke ? colorToCss(stroke) : "#CCC"}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        strokeWidth="1"
        opacity={`${opacity ?? 100}%`}
      />
    </g>
  );
}
