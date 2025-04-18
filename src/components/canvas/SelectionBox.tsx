import { useSelf, useStorage } from "@liveblocks/react";
import { memo } from "react";
import useSelectionBounds from "~/hooks/useSelectionBounds";
import { LayerType, Side, XYWH } from "~/types";
import TextSelectionBox from "./TextSelectionBox";

const handleWidth = 8; // Размер маркеров
const handleEdgeWidth = 4; // Ширина областей для изменения размера при наведении на стороны

const SelectionBox = memo(
  ({
    onResizeHandlePointerDown,
    isEditing,
  }: {
    onResizeHandlePointerDown: (side: Side, initialBounds: XYWH) => void;
    isEditing: boolean;
  }) => {
    // Вызываем все хуки до условных операторов
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null,
    );

    const layerType = useStorage((root) =>
      soleLayerId ? root.layers.get(soleLayerId)?.type : null,
    );

    const bounds = useSelectionBounds();

    // Если нет границ или id слоя, ничего не рендерим
    if (!bounds || !soleLayerId) return null;

    // Если выбран текстовый элемент, используем TextSelectionBox
    if (layerType === LayerType.Text) {
      return (
        <TextSelectionBox
          onResizeHandlePointerDown={onResizeHandlePointerDown}
          isEditing={isEditing}
        />
      );
    }

    // Для остальных типов элементов используем стандартный SelectionBox
    return (
      <>
        {/*Отображение рамки выделения*/}
        <rect
          style={{ transform: `translate(${bounds.x}px, ${bounds.y}px)` }}
          className="pointer-events-none fill-transparent stroke-primary-light stroke-[1px] stroke-[2px]"
          width={bounds.width}
          height={bounds.height}
        />

        {/* Бокс с размерами элементами */}
        {!isEditing && (
          <>
            <rect
              className="fill-primary-light"
              x={bounds.x + bounds.width / 2 - 30}
              y={bounds.y + bounds.height + 10}
              width={60}
              height={20}
              rx={4}
            />

            {/* Текст в боксе */}
            <text
              style={{
                transform: `translate(${bounds.x + bounds.width / 2}px, ${bounds.y + bounds.height + 25}px)`,
              }}
              textAnchor="middle"
              className="pointer-events-none select-none fill-text-white-0 text-paragraph-xs"
            >
              {Math.round(bounds.width)} × {Math.round(bounds.height)}
            </text>
          </>
        )}

        {/* Маркеры и области изменения размера */}
        {!isEditing && (
          <>
            {/* Левый край */}
            <rect
              style={{
                cursor: "ew-resize",
                width: `${handleEdgeWidth}px`,
                height: `${bounds.height}px`,
                transform: `translate(${bounds.x - handleEdgeWidth / 2}px, ${bounds.y}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Left, bounds);
              }}
            />

            {/* Правый край */}
            <rect
              style={{
                cursor: "ew-resize",
                width: `${handleEdgeWidth}px`,
                height: `${bounds.height}px`,
                transform: `translate(${bounds.x + bounds.width - handleEdgeWidth / 2}px, ${bounds.y}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Right, bounds);
              }}
            />

            {/* Верхний край */}
            <rect
              style={{
                cursor: "ns-resize",
                width: `${bounds.width}px`,
                height: `${handleEdgeWidth}px`,
                transform: `translate(${bounds.x}px, ${bounds.y - handleEdgeWidth / 2}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top, bounds);
              }}
            />

            {/* Нижний край */}
            <rect
              style={{
                cursor: "ns-resize",
                width: `${bounds.width}px`,
                height: `${handleEdgeWidth}px`,
                transform: `translate(${bounds.x}px, ${bounds.y + bounds.height - handleEdgeWidth / 2}px)`,
              }}
              className="pointer-events-auto fill-transparent"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom, bounds);
              }}
            />

            {/* Левый верхний маркер */}
            <rect
              style={{
                cursor: "nwse-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x - handleWidth / 2}px, ${bounds.y - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-primary-light stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Left, bounds);
              }}
            />

            {/* Правый верхний маркер */}
            <rect
              style={{
                cursor: "nesw-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x + bounds.width - handleWidth / 2}px, ${bounds.y - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-primary-light stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Right, bounds);
              }}
            />

            {/* Левый нижний маркер */}
            <rect
              style={{
                cursor: "nesw-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x - handleWidth / 2}px, ${bounds.y + bounds.height - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-primary-light stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Left, bounds);
              }}
            />

            {/* Правый нижний маркер */}
            <rect
              style={{
                cursor: "nwse-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x + bounds.width - handleWidth / 2}px, ${bounds.y + bounds.height - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-primary-light stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Right, bounds);
              }}
            />
          </>
        )}
      </>
    );
  },
);

SelectionBox.displayName = "SelectionBox";

export default SelectionBox;
