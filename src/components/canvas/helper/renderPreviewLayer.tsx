import { CanvasMode, CanvasState, LayerType } from "~/types";
import { memo, useEffect, useRef, useState } from "react";

const handleWidth = 8; // Размер маркеров
const handleEdgeWidth = 4; // Ширина областей для изменения размера при наведении на

function isCreatingShape(state: CanvasState): state is CanvasState & {
  origin: { x: number; y: number };
  current: { x: number; y: number };
  isShiftPressed: boolean;
} {
  return (
    state.mode === CanvasMode.CreatingShape &&
    state.origin !== undefined &&
    state.current !== undefined
  );
}

const RenderPreviewLayer = memo(
  ({ canvasState }: { canvasState: CanvasState }) => {
    const textRef = useRef<SVGTextElement>(null); // Ссылка на текстовый элемент
    const [textWidth, setTextWidth] = useState(0); // Ширина текстового блока с размерами
    const padding = 8; // Отступ текста от рамки

    // Закрепляем `origin` как начальную точку
    let x = 0,
      y = 0,
      width = 0,
      height = 0;

    if (isCreatingShape(canvasState)) {
      x = Math.min(canvasState.origin.x, canvasState.current.x);
      y = Math.min(canvasState.origin.y, canvasState.current.y);
      width = Math.abs(canvasState.current.x - canvasState.origin.x);
      height = Math.abs(canvasState.current.y - canvasState.origin.y);

      // Если Shift нажат, сделаем фигуру пропорциональной, но с сохранением origin
      if (canvasState.isShiftPressed) {
        const side = Math.max(width, height);
        width = side;
        height = side;

        // Корректируем позицию, чтобы origin оставался в центре
        if (canvasState.current.x < canvasState.origin.x) {
          // Если текущая точка слева от origin, сдвигаем влево
          x = canvasState.origin.x - side;
        }
        if (canvasState.current.y < canvasState.origin.y) {
          // Если текущая точка выше origin, сдвигаем вверх
          y = canvasState.origin.y - side;
        }
      }
    }

    const bounds = { x, y, width, height };

    // Определяем ширину текста с размерами элемента
    useEffect(() => {
      if (textRef.current) {
        const bbox = textRef.current.getBBox();
        setTextWidth(bbox.width);
      }
    }, [bounds]);

    if (
      canvasState.mode !== CanvasMode.CreatingShape ||
      !isCreatingShape(canvasState)
    ) {
      return null;
    }

    return (
      <>
        {canvasState.layerType === LayerType.Rectangle && (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(217, 217, 217)"
          />
        )}

        {/*Отображение рамки выделения*/}
        <rect
          style={{ transform: `translate(${bounds.x}px, ${bounds.y}px)` }}
          className="pointer-events-none fill-transparent stroke-primary-light stroke-[2px]"
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

        {/* Левый край */}
        <rect
          style={{
            cursor: "ew-resize",
            width: `${handleEdgeWidth}px`,
            height: `${bounds.height}px`,
            transform: `translate(${bounds.x - handleEdgeWidth / 2}px, ${bounds.y}px)`,
          }}
          className="pointer-events-auto fill-transparent"
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
        />
      </>
    );
  },
);

RenderPreviewLayer.displayName = "RenderPreviewLayer";

export default RenderPreviewLayer;
