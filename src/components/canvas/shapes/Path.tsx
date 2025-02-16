/*** Рендеринг пути ***/

import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "~/utils";

export default function Path({
  x,
  y,
  stroke,
  fill,
  opacity,
  points,
  onPointerDown,
}: {
  x: number;
  y: number;
  stroke?: string;
  fill: string;
  opacity: number;
  points: number[][];
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  // Генерация сглаженного пути SVG
  const pathData = getSvgPathFromStroke(
    getStroke(points, {
      size: 10,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    }),
  );

  return (
    <g className="group">
      {/* Контур векторного пути при выделении */}
      <path
        className="pointer-events-none opacity-0 group-hover:opacity-100"
        style={{ transform: `translate(${x}px, ${y}px)` }}
        d={pathData}
        fill="none"
        stroke="#4183ff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Векторный путь */}
      <path
        onPointerDown={onPointerDown}
        style={{ transform: `translate(${x}px, ${y}px)` }}
        d={pathData}
        fill={fill}
        stroke={stroke ?? "#CCC"}
        strokeWidth={1}
        opacity={`${opacity ?? 100}%`}
      />
    </g>
  );
}
