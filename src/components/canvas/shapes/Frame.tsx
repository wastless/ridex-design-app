"use client";

/**
 * Компонент для отображения рамки (фрейма) на холсте
 * Рамка может содержать другие слои и имеет уникальное название
 */

import React, { memo, useState } from "react";
import { useSelf, useRoom } from "@liveblocks/react";
import { CanvasMode, type FrameLayer } from "~/types";
import { colorToCss, generateLayerName } from "~/utils";
import { useCanvas } from "../helper/CanvasContext";

interface FrameProps {
  id: string;
  layer: FrameLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  canvasMode: CanvasMode;
}

/**
 * Компонент рамки, который может содержать другие слои
 * Оптимизирован с помощью React.memo для предотвращения лишних перерисовок
 */
const Frame = memo(({ id, layer, onPointerDown, canvasMode }: FrameProps) => {
  // Получаем camera для масштабирования обводки
  const { camera } = useCanvas();

  // Проверяем, находимся ли мы в режиме выделения/перемещения
  const isSelectionMode =
    canvasMode === CanvasMode.None ||
    canvasMode === CanvasMode.Pressing ||
    canvasMode === CanvasMode.SelectionNet ||
    canvasMode === CanvasMode.Translating ||
    canvasMode === CanvasMode.Resizing;

  // Состояние для отслеживания наведения курсора
  const [isHovered, setIsHovered] = useState(false);

  // Определяем стили фона и обводки
  const fill = layer.fill ? colorToCss(layer.fill) : "transparent";
  const stroke = layer.stroke ? colorToCss(layer.stroke) : "transparent";

  // Толщина обводки с учетом масштаба
  const strokeWidth = isHovered ? 2 / camera.zoom : 0; // 2px при наведении, масштабируется с зумом

  // Получаем идентификаторы дочерних элементов
  const childIds = layer.childIds || [];

  // Получаем текущую комнату для формирования имени рамки
  const room = useRoom();

  // Генерируем имя рамки на основе её ID и типа
  const frameName = generateLayerName(id, layer.type, room.id);

  // Проверяем, является ли текущий слой выбранным
  const isSelected = useSelf((me) => me.presence.selection.includes(id));

  // Определяем цвет текста в зависимости от состояния (выбрана или при наведении)
  const textColor = isSelected || isHovered ? "#4183ff" : "rgba(0, 0, 0, 0.3)";

  return (
    <g
      onPointerDown={(e) => onPointerDown(e, id)}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      {/* Основная рамка фрейма */}
      <rect
        className={isSelectionMode ? "cursor-move" : "cursor-default"}
        style={{
          opacity: layer.opacity / 100,
          mixBlendMode: (layer.blendMode ||
            "normal") as React.CSSProperties["mixBlendMode"],
        }}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        rx={layer.cornerRadius || 0}
        ry={layer.cornerRadius || 0}
      />

      {/* Обводка при наведении или выделении */}
      {isHovered && (
        <rect
          style={{
            opacity: layer.opacity / 100,
            pointerEvents: "none",
          }}
          x={layer.x}
          y={layer.y}
          width={layer.width}
          height={layer.height}
          fill="none"
          stroke="#4183ff"
          strokeWidth={3 / camera.zoom}
          rx={layer.cornerRadius || 0}
          ry={layer.cornerRadius || 0}
        />
      )}

      {/* Название рамки в левом верхнем углу */}
      <text
        x={layer.x + 0 / camera.zoom}
        y={layer.y - 8 / camera.zoom}
        fontSize={11 / camera.zoom}
        fill={textColor}
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          userSelect: "none",
          cursor: isSelectionMode ? "move" : "default",
          fontFamily: "Inter, sans-serif",
          fontWeight: "500",
        }}
      >
        {frameName}
      </text>
    </g>
  );
});

// Устанавливаем displayName для отладки в DevTools
Frame.displayName = "Frame";

export default Frame;
