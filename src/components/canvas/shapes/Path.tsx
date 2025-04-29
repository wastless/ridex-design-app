"use client";

/**
 * Компонент для отображения нарисованных путей на холсте
 * Использует библиотеку perfect-freehand для создания плавных линий
 */

import React, { useState } from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "~/utils";
import { CanvasMode } from "~/types";
import { useCanvas } from "../helper/CanvasContext";

type PathProps = {
  x: number;
  y: number;
  stroke?: string;
  fill: string;
  opacity: number;
  points: number[][];
  onPointerDown?: (e: React.PointerEvent) => void;
  blendMode?: string;
  canvasMode: CanvasMode;
  strokeWidth?: number;
};

/**
 * Компонент для отображения нарисованного пути
 * Преобразует набор точек в плавную SVG-линию
 */
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
  strokeWidth = 1,
}: PathProps) {
  // Получаем camera для масштабирования обводки
  const { camera } = useCanvas();
  // Состояние для отслеживания наведения курсора
  const [isHovering, setIsHovering] = useState(false);

  // Масштабированное значение толщины обводки
  const scaledStrokeWidth = strokeWidth / camera.zoom;

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
      size: 1, // Очень тонкая линия для центра пути
      thinning: 0,
      smoothing: 0.5,
      streamline: 0.5,
    }),
  );

  // Определяем, должны ли мы показывать обводку выделения
  const shouldShowOutline = [
    CanvasMode.None,
    CanvasMode.RightClick,
    CanvasMode.SelectionNet,
    CanvasMode.Translating,
    CanvasMode.Pressing,
  ].includes(canvasMode);

  return (
    <g
      className="group"
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
    >
      {/* Основной векторный путь */}
      <path
        onPointerDown={onPointerDown}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          mixBlendMode:
            (blendMode as React.CSSProperties["mixBlendMode"]) ?? "normal",
          opacity: `${opacity ?? 100}%`,
        }}
        d={pathData}
        fill={fill}
        stroke={stroke ?? undefined}
        strokeWidth={stroke ? scaledStrokeWidth : 0}
      />

      {/* Тонкая линия по центру пути при наведении для выделения */}
      {shouldShowOutline && isHovering && (
        <path
          style={{
            transform: `translate(${x}px, ${y}px)`,
            pointerEvents: "none",
          }}
          d={centerlinePathData}
          fill="none"
          stroke="#4183ff"
          strokeWidth={1 / camera.zoom}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none"
        />
      )}
    </g>
  );
}
