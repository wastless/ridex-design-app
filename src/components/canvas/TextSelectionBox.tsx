import { useSelf, useStorage } from "@liveblocks/react";
import { memo, useEffect, useRef, useState } from "react";
import useSelectionBounds from "~/hooks/useSelectionBounds";
import { Side, XYWH, TextLayer } from "~/types";

const handleWidth = 8;
const handleEdgeWidth = 4;

const TextSelectionBox = memo(
  ({
    onResizeHandlePointerDown,
    isEditing,
  }: {
    onResizeHandlePointerDown: (side: Side, initialBounds: XYWH) => void;
    isEditing: boolean;
  }) => {
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null,
    );

    // Получаем слой и проверяем, что это текст
    const layer = useStorage((root) =>
      soleLayerId ? (root.layers.get(soleLayerId) as TextLayer) : null,
    );

    const isShowingHandles = !isEditing && layer;

    // Используем реальные размеры текстового контейнера вместо bounds
    const textBounds = layer ? {
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height // Используем height из слоя, который соответствует реальной высоте контейнера
    } : null;

    const textRef = useRef<SVGTextElement>(null);
    const [textWidth, setTextWidth] = useState(0);
    const padding = 8;

    useEffect(() => {
      if (textRef.current) {
        const bbox = textRef.current.getBBox();
        setTextWidth(bbox.width);
      }
    }, [textBounds]);

    if (!textBounds || !layer) return null;

    return (
      <>
        {/* Рамка выделения */}
        <rect
          style={{ transform: `translate(${textBounds.x}px, ${textBounds.y}px)` }}
          className="pointer-events-none fill-transparent stroke-primary-light stroke-[1px] stroke-[2px]"
          width={textBounds.width}
          height={textBounds.height}
        />

        {/* Размеры текста */}
        {!isEditing && (
          <>
            <rect
              className="fill-primary-light"
              x={textBounds.x + textBounds.width / 2 - (textWidth + padding) / 2}
              y={textBounds.y + textBounds.height + 10}
              width={textWidth + padding}
              height={20}
              rx={4}
            />
            <text
              ref={textRef}
              style={{
                transform: `translate(${textBounds.x + textBounds.width / 2}px, ${textBounds.y + textBounds.height + 25}px)`,
              }}
              textAnchor="middle"
              className="pointer-events-none select-none fill-text-white-0 text-paragraph-xs"
            >
              {Math.round(textBounds.width)} × {Math.round(textBounds.height)} (lh: {layer.lineHeight})
            </text>
          </>
        )}

        {isShowingHandles && (
          <>
            {/* Левый край */}
            <rect
              style={{
                cursor: "ew-resize",
                width: `${handleEdgeWidth}px`,
                height: `${textBounds.height}px`,
                transform: `translate(${textBounds.x - handleEdgeWidth / 2}px, ${textBounds.y}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Left, textBounds);
              }}
            />

            {/* Правый край */}
            <rect
              style={{
                cursor: "ew-resize",
                width: `${handleEdgeWidth}px`,
                height: `${textBounds.height}px`,
                transform: `translate(${textBounds.x + textBounds.width - handleEdgeWidth / 2}px, ${textBounds.y}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Right, textBounds);
              }}
            />

            {/* Верхний край */}
            <rect
              style={{
                cursor: "ns-resize",
                width: `${textBounds.width}px`,
                height: `${handleEdgeWidth}px`,
                transform: `translate(${textBounds.x}px, ${textBounds.y - handleEdgeWidth / 2}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top, textBounds);
              }}
            />

            {/* Нижний край */}
            <rect
              style={{
                cursor: "ns-resize",
                width: `${textBounds.width}px`,
                height: `${handleEdgeWidth}px`,
                transform: `translate(${textBounds.x}px, ${textBounds.y + textBounds.height - handleEdgeWidth / 2}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom, textBounds);
              }}
            />

            {/* Маркеры углов */}
            <rect
              style={{
                cursor: "nwse-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${textBounds.x - handleWidth / 2}px, ${textBounds.y - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-primary-light stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Left, textBounds);
              }}
            />

            <rect
              style={{
                cursor: "nesw-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${textBounds.x + textBounds.width - handleWidth / 2}px, ${textBounds.y - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-primary-light stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Right, textBounds);
              }}
            />

            <rect
              style={{
                cursor: "nesw-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${textBounds.x - handleWidth / 2}px, ${textBounds.y + textBounds.height - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-primary-light stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Left, textBounds);
              }}
            />

            <rect
              style={{
                cursor: "nwse-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${textBounds.x + textBounds.width - handleWidth / 2}px, ${textBounds.y + textBounds.height - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-primary-light stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Right, textBounds);
              }}
            />
          </>
        )}
      </>
    );
  },
);

TextSelectionBox.displayName = "TextSelectionBox";

export default TextSelectionBox; 