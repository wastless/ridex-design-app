"use client";

/**
 * Компонент для отображения предварительного вида слоев при их создании
 * Показывает контур и размеры создаваемого слоя, а также маркеры для изменения размеров
 */

import { CanvasMode, type CanvasState, LayerType } from "~/types";
import { memo, useEffect, useMemo, useRef, useState } from "react";

const handleWidth = 8; // Размер маркеров изменения размера
const handleEdgeWidth = 4; // Ширина областей для изменения размера при наведении на край

/**
 * Проверяет, находится ли состояние холста в режиме создания фигуры
 * и имеет ли все необходимые свойства для отрисовки превью
 */
function isCreatingShape(state: CanvasState): state is CanvasState & {
  origin: { x: number; y: number };
  current: { x: number; y: number };
  isShiftPressed: boolean;
  layerType: LayerType;
} {
  return (
    state.mode === CanvasMode.CreatingShape &&
    state.origin !== undefined &&
    state.current !== undefined &&
    "layerType" in state
  );
}

/**
 * Компонент отображения предварительного вида слоя при его создании
 */
const RenderPreviewLayer = memo(
  ({ canvasState }: { canvasState: CanvasState }) => {
    const textRef = useRef<SVGTextElement>(null); // Ссылка на текстовый элемент с размерами
    const [textWidth, setTextWidth] = useState(0); // Ширина текстового блока с размерами
    const padding = 8; // Отступ текста от рамки в боксе с размерами

    // Вычисляем координаты и размеры создаваемой фигуры
    let x = 0,
      y = 0,
      width = 0,
      height = 0;

    if (isCreatingShape(canvasState)) {
      // Определяем координаты левого верхнего угла, беря минимальные значения
      x = Math.min(canvasState.origin.x, canvasState.current.x);
      y = Math.min(canvasState.origin.y, canvasState.current.y);
      // Вычисляем ширину и высоту, как разницу между координатами
      width = Math.abs(canvasState.current.x - canvasState.origin.x);
      height = Math.abs(canvasState.current.y - canvasState.origin.y);

      // Если нажата клавиша Shift, делаем фигуру квадратной (пропорциональной)
      if (canvasState.isShiftPressed) {
        const side = Math.max(width, height); // Берем большую сторону
        width = side;
        height = side;

        // Корректируем позицию, чтобы начальная точка оставалась в том же месте
        if (canvasState.current.x < canvasState.origin.x) {
          // Если текущая точка слева от начальной, сдвигаем влево
          x = canvasState.origin.x - side;
        }
        if (canvasState.current.y < canvasState.origin.y) {
          // Если текущая точка выше начальной, сдвигаем вверх
          y = canvasState.origin.y - side;
        }
      }

      // Для изображений сохраняем пропорции
      if (
        canvasState.layerType === LayerType.Image &&
        "imageData" in canvasState &&
        canvasState.imageData
      ) {
        // Для изображений не показываем превью при растягивании
        // Они вставляются только одиночным кликом в оригинальном размере
        return null;
      }
    }

    // Мемоизируем вычисленные границы для предотвращения лишних перерисовок
    const bounds = useMemo(() => {
      return { x, y, width, height };
    }, [x, y, width, height]);

    // Определяем ширину текста с размерами элемента для правильного центрирования
    useEffect(() => {
      if (textRef.current) {
        const bbox = textRef.current.getBBox();
        setTextWidth(bbox.width);
      }
    }, [bounds]);

    // Не отображаем превью в следующих случаях:
    // - режим не CreateShape
    // - отсутствуют начальная или текущая точка
    // - точки совпадают (одиночный клик без движения)
    // - создается изображение (для них отдельный процесс)
    if (
      canvasState.mode !== CanvasMode.CreatingShape ||
      !isCreatingShape(canvasState) ||
      !canvasState.origin ||
      (canvasState.origin.x === canvasState.current.x &&
        canvasState.origin.y === canvasState.current.y) || // Одиночный клик
      canvasState.layerType === LayerType.Image // Изображения
    ) {
      return null;
    }

    return (
      <>
        {/* Отображение предварительного вида прямоугольника */}
        {canvasState.layerType === LayerType.Rectangle && (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(217, 217, 217)"
          />
        )}

        {/* Отображение предварительного вида эллипса */}
        {canvasState.layerType === LayerType.Ellipse && (
          <ellipse
            cx={x + width / 2}
            cy={y + height / 2}
            rx={width / 2}
            ry={height / 2}
            fill="rgba(217, 217, 217)"
          />
        )}

        {/* Отображение предварительного вида фрейма */}
        {canvasState.layerType === LayerType.Frame && (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(255, 255, 255, 0.5)"
            stroke="rgba(0, 0, 0, 0.2)"
            strokeDasharray="5,5"
            strokeWidth={1}
          />
        )}

        {/* Рамка выделения вокруг создаваемой фигуры */}
        <rect
          style={{ transform: `translate(${bounds.x}px, ${bounds.y}px)` }}
          className="pointer-events-none fill-transparent stroke-primary-light stroke-[2px]"
          width={bounds.width}
          height={bounds.height}
        />

        {/* Контейнер для отображения размеров элемента */}
        <rect
          className="fill-primary-light"
          x={bounds.x + bounds.width / 2 - (textWidth + padding) / 2}
          y={bounds.y + bounds.height + 10}
          width={textWidth + padding}
          height={20}
          rx={4}
        />

        {/* Текст с отображением размеров элемента */}
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

        {/* Маркеры и области для изменения размера */}
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

        {/* Маркеры по углам для изменения размера */}
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

// Задаем displayName для memo-компонента (помогает при отладке)
RenderPreviewLayer.displayName = "RenderPreviewLayer";

export default RenderPreviewLayer;
