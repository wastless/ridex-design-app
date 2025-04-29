"use client";

import React, { useState, useEffect } from "react";
import {
  colorToCss,
  calculateAPCAContrast,
  evaluateAPCAContrast,
} from "~/utils";
import { Color as ColorType, LayerType } from "~/types";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { useStorage, useSelf } from "@liveblocks/react";
import * as Tooltip from "~/components/ui/tooltip";
import { RiCloseLine, RiInformationFill } from "@remixicon/react";

// Вспомогательная функция для работы с LiveObject и обычными объектами
function getLayerProperty<T>(layer: any, property: string, defaultValue: T): T {
  if (!layer) return defaultValue;

  if ("get" in layer) {
    // Для LiveObject
    return layer.get(property) as unknown as T;
  } else {
    // Для обычных объектов
    return layer[property] as unknown as T;
  }
}

// Основной компонент для отображения информации о контрасте
interface ContrastDisplayProps {
  colorHex: string;
  layer: any;
}

export const ContrastDisplay: React.FC<ContrastDisplayProps> = ({
  colorHex,
  layer,
}) => {
  const { roomColor } = useCanvas();
  const [backgroundInfo, setBackgroundInfo] = useState<{
    name: string;
    color: string;
  } | null>(null);

  // Получаем все слои
  const layers = useStorage((root) => root.layers);
  const layerIds = useStorage((root) => root.layerIds);
  const selectedId = useSelf((me) => me.presence.selection[0] || null);

  // Проверяем тип слоя - для изображений контраст не показываем
  const layerType = layer
    ? getLayerProperty<LayerType>(layer, "type", LayerType.Rectangle)
    : null;
  if (layerType === LayerType.Image) return null;

  // Определяем какой слой находится под выделенным слоем
  useEffect(() => {
    if (!selectedId || !layers || !layerIds || !layer) return;

    // По умолчанию это фон холста
    const canvasBackground = roomColor ? colorToCss(roomColor) : "#EFEFEF";
    let backgroundLayer = { name: "холстом", color: canvasBackground };
    
    // Получаем координаты выбранного слоя
    const selectedLayer = layers.get(selectedId);
    if (!selectedLayer) {
      setBackgroundInfo(backgroundLayer);
      return;
    }
    
    // Получаем координаты выбранного слоя
    const selectedX = getLayerProperty<number>(selectedLayer, "x", 0);
    const selectedY = getLayerProperty<number>(selectedLayer, "y", 0);
    const selectedWidth = getLayerProperty<number>(selectedLayer, "width", 0);
    const selectedHeight = getLayerProperty<number>(selectedLayer, "height", 0);

    // Проверяем все слои и ищем те, что находятся под выбранным
    const centerX = selectedX + selectedWidth / 2;
    const centerY = selectedY + selectedHeight / 2;

    // Получаем z-порядок слоев
    const layerIdsArray = Array.isArray(layerIds) ? layerIds : [...layerIds];

    // Переменные для хранения найденных слоев
    let foundParentFrame = null;
    let underlyingLayer = null;

    // Перебираем в обратном порядке, чтобы начать с верхних слоев
    for (let i = layerIdsArray.length - 1; i >= 0; i--) {
      const id = layerIdsArray[i];
      if (id === selectedId) continue; // Пропускаем сам выбранный слой

      const curLayer = layers.get(id);
      if (!curLayer) continue;

      // Получаем координаты текущего слоя
      const curX = getLayerProperty<number>(curLayer, "x", 0);
      const curY = getLayerProperty<number>(curLayer, "y", 0);
      const curWidth = getLayerProperty<number>(curLayer, "width", 0);
      const curHeight = getLayerProperty<number>(curLayer, "height", 0);
      const curType = getLayerProperty<LayerType>(
        curLayer,
        "type",
        LayerType.Rectangle,
      );

      // Проверяем, находится ли центр выбранного слоя внутри текущего
      const isInside =
        centerX >= curX &&
        centerX <= curX + curWidth &&
        centerY >= curY &&
        centerY <= curY + curHeight;

      if (isInside) {
        // Если это фрейм, отмечаем его как родительский
        if (curType === LayerType.Frame) {
          foundParentFrame = curLayer;
        }

        // Сохраняем первый найденный слой как находящийся под выбранным
        if (!underlyingLayer) {
          underlyingLayer = curLayer;
        }
      }
    }

    // Определяем приоритет отображения фона: 
    // 1. Слой под объектом
    // 2. Родительская рамка 
    // 3. Фон холста
    if (underlyingLayer) {
      const layerFill = getLayerProperty<ColorType | null>(
        underlyingLayer,
        "fill",
        null,
      );
        
      if (layerFill) {
        let layerName = "объектом";
         
        const layerType = getLayerProperty<LayerType>(
          underlyingLayer,
          "type",
          LayerType.Rectangle,
        );
        if (layerType === LayerType.Rectangle) {
          layerName = "прямоугольником";
        } else if (layerType === LayerType.Ellipse) {
          layerName = "эллипсом";
        } else if (layerType === LayerType.Triangle) {
          layerName = "треугольником";
        } else if (layerType === LayerType.Text) {
          layerName = "текстом";
        }
        
        backgroundLayer = { 
          name: layerName, 
          color: colorToCss(layerFill),
        };
      }
    } else if (foundParentFrame) {
      // Получаем цвет фрейма
      const frameFill = getLayerProperty<ColorType | null>(
        foundParentFrame,
        "fill",
        null,
      );
        
      if (frameFill) {
        backgroundLayer = { 
          name: "рамкой", 
          color: colorToCss(frameFill),
        };
      }
    }
    
    setBackgroundInfo(backgroundLayer);
  }, [selectedId, layers, layerIds, layer, roomColor]);

  // Если нет данных о фоне, не показываем ничего
  if (!backgroundInfo) return null;

  // Расчет контраста между объектом и фоном
  const contrastValue = calculateAPCAContrast(colorHex, backgroundInfo.color);
  const evalContrast = evaluateAPCAContrast(contrastValue);

  return (
    <>
      <div className="mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-paragraph-sm text-text-strong-950">Контраст APCA:</span>
          </div>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <span className="text-paragraph-sm">
                    {Math.abs(contrastValue).toFixed(0)}
                  </span>
                  {(evalContrast.level === 'Низкий' || evalContrast.level === 'Плохой') ? (
                    <RiCloseLine style={{ color: evalContrast.color }} size={16} className="text-paragraph-sm text-text-strong-950" />
                  ) : (
                    <span
                      style={{ color: evalContrast.color }}
                      className="text-paragraph-sm"
                    >
                      {evalContrast.level}
                    </span>
                  )}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content size="small" variant='light' side='left'>
                <div className="max-w-[220px]">
                  <p className="text-label-sm">
                    WCAG APCA: {evalContrast.level !== 'Низкий' && evalContrast.level !== 'Плохой' ? evalContrast.level : 'Недостаточный'} (
                    {Math.abs(contrastValue).toFixed(0)})
                  </p>
                  <p>{evalContrast.description}</p>
                </div>
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </div>
    </>
  );
};

export default ContrastDisplay;
