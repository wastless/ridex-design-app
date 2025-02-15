import { useSelf, useStorage } from "@liveblocks/react";
import { memo, useEffect, useRef, useState } from "react";
import useSelectionBounds from "~/hooks/useSelectionBounds";
import { LayerType, Side, XYWH } from "~/types";

const handleWidth = 8; // Размер маркеров
const handleEdgeWidth = 4; // Ширина областей для изменения размера при наведении на стороны

const SelectionBox = memo(
  ({
    onResizeHandlePointerDown,
  }: {
    onResizeHandlePointerDown: (side: Side, initialBounds: XYWH) => void;
  }) => {
    // Получение id выбранного слоя
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null,
    );

    // Проверяем, можно ли показывать маркеры (если выбран только один слой и это не путь)
    const isShowingHandles = useStorage(
      (root) =>
        soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path,
    );

    const bounds = useSelectionBounds(); // Определяем границы выделенного объекта
    const textRef = useRef<SVGTextElement>(null); // Ссылка на текстовый элемент
    const [textWidth, setTextWidth] = useState(0); // Ширина текстового блока с размерами
    const padding = 8; // Отступ текста от рамки

    // Определяем ширину текста с размерами элемента
    useEffect(() => {
      if (textRef.current) {
        const bbox = textRef.current.getBBox();
        setTextWidth(bbox.width);
      }
    }, [bounds]);

    if (!bounds) return null; // Если нет границ объекта, ничего не рендерим

    return (
      <>
        {/*Отображение рамки выделения*/}
        <rect
          style={{ transform: `translate(${bounds.x}px, ${bounds.y}px)` }}
          className="stroke-primary-light stroke-[2px] pointer-events-none fill-transparent stroke-[1px]"
          width={bounds.width}
          height={bounds.height}
        />

        {/* Бокс с размерами элементами */}
        <rect
          className="fill-primary-light"
          x={bounds.x + bounds.width / 2 - (textWidth + padding) / 2}
          y={bounds.y + bounds.height + 10}
          width={textWidth + padding}
          height={20}
          rx={4}
        />

        {/* Текст в боксе */}
        <text
          ref={textRef}
          style={{
            transform: `translate(${bounds.x + bounds.width / 2}px, ${bounds.y + bounds.height + 25}px)`,
          }}
          textAnchor="middle"
          className="pointer-events-none select-none fill-text-white-0 text-paragraph-xs"
        >
          {Math.round(bounds.width)} × {Math.round(bounds.height)}
        </text>

        {isShowingHandles && (
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
              className="stroke-primary-light fill-white stroke-[1px]"
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
              className="stroke-primary-light fill-white stroke-[1px]"
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
              className="stroke-primary-light fill-white stroke-[1px]"
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
              className="stroke-primary-light fill-white stroke-[1px]"
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