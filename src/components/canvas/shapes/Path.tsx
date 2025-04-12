/*** Рендеринг пути ***/

import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "~/utils";
import React, { useState } from "react";
import { CanvasMode } from "~/types";

export default function Path({
  x,
  y,
  stroke,
  fill,
  opacity,
  points,
  onPointerDown,
  blendMode,
  canvasMode,
}: {
  x: number;
  y: number;
  stroke?: string;
  fill: string;
  opacity: number;
  points: number[][];
  onPointerDown?: (e: React.PointerEvent) => void;
  blendMode?: string;
  canvasMode: CanvasMode;
}) {
  const [isHovering, setIsHovering] = useState(false);

  // Генерация сглаженного пути SVG для основного пути
  const pathData = getSvgPathFromStroke(
    getStroke(points, {
      size: 10,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    }),
  );

  // Генерация тонкого пути для выделения при наведении
  const centerlinePathData = getSvgPathFromStroke(
    getStroke(points, {
      size: 1, // Очень тонкая линия
      thinning: 0,
      smoothing: 0.5,
      streamline: 0.5,
    }),
  );

  const shouldShowOutline = [
    CanvasMode.None,
    CanvasMode.RightClick,
    CanvasMode.SelectionNet,
    CanvasMode.Translating,
    CanvasMode.Pressing
  ].includes(canvasMode);

  return (
    <g 
      className="group" 
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Векторный путь */}
      <path
        onPointerDown={onPointerDown}
        style={{ 
          transform: `translate(${x}px, ${y}px)`,
          mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'] || 'normal',
          opacity: `${opacity ?? 100}%`
        }}
        d={pathData}
        fill={fill}
        stroke={stroke ?? undefined}
        strokeWidth={stroke ? 1 : 0}
      />

      {/* Тонкая линия по центру пути при наведении */}
      {shouldShowOutline && isHovering && (
        <path
          style={{ transform: `translate(${x}px, ${y}px)` }}
          d={centerlinePathData}
          fill="none"
          stroke="#4183ff"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none"
        />
      )}
    </g>
  );
}