"use client";

/**
 * Универсальный компонент для рендеринга различных типов слоев на холсте.
 * Работает как диспетчер, определяющий какой специализированный компонент
 * нужно отрисовать в зависимости от типа слоя (прямоугольник, эллипс,
 * треугольник, текст, путь, изображение, фрейм).
 *
 * Мемоизирован для оптимизации производительности при частых перерисовках.
 */

import { useStorage } from "@liveblocks/react";
import React, { memo } from "react";
import type { CanvasMode } from "~/types";
import { LayerType } from "~/types";
import { colorToCss } from "~/utils";

// Импортируем компоненты для разных типов слоев
import Rectangle from "./shapes/Rectangle";
import Ellipse from "./shapes/Ellipse";
import Text from "./shapes/Text";
import Path from "./shapes/Path";
import Frame from "./shapes/Frame";
import Triangle from "./shapes/Triangle";
import Image from "./shapes/Image";

/**
 * Интерфейс пропсов для компонента LayerComponent
 *
 * @param id - Уникальный идентификатор слоя
 * @param onLayerPointerDown - Обработчик события нажатия указателя на слой
 * @param canvasMode - Текущий режим холста
 * @param setIsEditingText - Функция для установки состояния редактирования текста
 * @param inFrame - Флаг, указывающий, находится ли слой внутри фрейма
 */
interface LayerComponentProps {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  canvasMode: CanvasMode;
  setIsEditingText: (isEditing: boolean) => void;
  _inFrame?: boolean;
}

/**
 * Компонент для рендеринга различных типов слоев на холсте.
 * Определяет тип слоя и рендерит соответствующий компонент.
 */
const LayerComponent = memo(
  ({
    id,
    onLayerPointerDown,
    canvasMode,
    setIsEditingText,
    _inFrame = false,
  }: LayerComponentProps) => {
    // Получение данных слоя из хранилища Liveblocks по его id
    const layer = useStorage((root) => root.layers.get(id));

    // Если слой отсутствует, ничего не рендерим
    if (!layer) {
      return null;
    }

    // Рендеринг слоя в зависимости от его типа
    switch (layer.type) {
      // Прямоугольник
      case LayerType.Rectangle:
        return (
          <Rectangle
            onPointerDown={onLayerPointerDown}
            id={id}
            layer={layer}
            canvasMode={canvasMode}
          />
        );

      // Эллипс
      case LayerType.Ellipse:
        return (
          <Ellipse
            onPointerDown={onLayerPointerDown}
            id={id}
            layer={layer}
            canvasMode={canvasMode}
          />
        );

      // Треугольник
      case LayerType.Triangle:
        return (
          <Triangle
            onPointerDown={onLayerPointerDown}
            id={id}
            layer={layer}
            canvasMode={canvasMode}
          />
        );

      // Путь (рукописная линия)
      case LayerType.Path:
        return (
          <Path
            onPointerDown={(e) => onLayerPointerDown(e, id)}
            points={layer.points}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCss(layer.fill) : "#000"}
            stroke={layer.stroke ? colorToCss(layer.stroke) : undefined}
            opacity={layer.opacity}
            blendMode={layer.blendMode}
            canvasMode={canvasMode}
            strokeWidth={layer.strokeWidth}
          />
        );

      // Текст
      case LayerType.Text:
        return (
          <Text
            onPointerDown={onLayerPointerDown}
            id={id}
            layer={layer}
            setIsEditingText={setIsEditingText}
            canvasMode={canvasMode}
          />
        );

      // Изображение
      case LayerType.Image:
        return (
          <Image
            onPointerDown={onLayerPointerDown}
            id={id}
            layer={layer}
            canvasMode={canvasMode}
            aria-label="image"
          />
        );

      // Фрейм (контейнер, содержащий другие элементы)
      case LayerType.Frame:
        // Получаем массив ID дочерних элементов фрейма
        const childIds = layer.childIds || [];

        // Создаем уникальный ID для области обрезки
        const clipPathId = `clip-path-${id}`;

        return (
          <g>
            {/* Определяем область обрезки для дочерних элементов */}
            <defs>
              <clipPath id={clipPathId}>
                <rect
                  x={layer.x}
                  y={layer.y}
                  width={layer.width}
                  height={layer.height}
                  rx={layer.cornerRadius ?? 0}
                  ry={layer.cornerRadius ?? 0}
                />
              </clipPath>
            </defs>

            {/* Рендерим сам фрейм */}
            <Frame
              onPointerDown={onLayerPointerDown}
              id={id}
              layer={layer}
              canvasMode={canvasMode}
            />

            {/* Рендерим все дочерние элементы внутри области обрезки */}
            <g clipPath={`url(#${clipPathId})`}>
              {childIds.map((childId) => (
                <LayerComponent
                  key={childId}
                  id={childId}
                  onLayerPointerDown={onLayerPointerDown}
                  canvasMode={canvasMode}
                  setIsEditingText={setIsEditingText}
                  _inFrame={true}
                />
              ))}
            </g>
          </g>
        );

      // Неизвестный тип слоя - выводим предупреждение в консоль
      default:
        console.warn("Неизвестный тип слоя");
        return null;
    }
  },
);

// Устанавливаем displayName для более удобной отладки в React DevTools
LayerComponent.displayName = "LayerComponent";

export default LayerComponent;
