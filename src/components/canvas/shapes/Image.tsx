"use client";

/**
 * Компонент для отображения изображений на холсте
 * Поддерживает настройку размеров, прозрачности и режима наложения
 */

import React, { memo } from "react";
import { CanvasMode, type ImageLayer } from "~/types";

type ImageProps = {
  id: string;
  layer: ImageLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  canvasMode: CanvasMode;
};

/**
 * Компонент для отображения слоя изображения
 * Оптимизирован с помощью React.memo для предотвращения лишних перерисовок
 */
const Image = memo(({ id, layer, onPointerDown, canvasMode }: ImageProps) => {
  // Деструктуризация свойств из объекта слоя
  const { x, y, width, height, opacity, url, blendMode } = layer;

  // Определяем режимы, когда необходимо игнорировать события указателя
  const isReadOnly = [CanvasMode.Pencil, CanvasMode.Inserting].includes(
    canvasMode,
  );

  return (
    <image
      id={id}
      className={`${isReadOnly ? "pointer-events-none" : "cursor-move"}`}
      href={url}
      x={x}
      y={y}
      width={width}
      height={height}
      preserveAspectRatio="none"
      opacity={opacity / 100}
      style={{
        mixBlendMode: (blendMode ||
          "normal") as React.CSSProperties["mixBlendMode"],
      }}
      onPointerDown={(e) => (isReadOnly ? null : onPointerDown(e, id))}
    />
  );
});

// Устанавливаем displayName для отладки в DevTools
Image.displayName = "Image";

export default Image;
