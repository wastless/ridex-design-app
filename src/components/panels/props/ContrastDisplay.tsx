"use client";

import React, { useState, useEffect } from "react";
import {
  colorToCss,
  calculateAPCAContrast,
  evaluateAPCAContrast,
} from "~/utils";
import type { Color as ColorType } from "~/types";
import { LayerType } from "~/types";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { useStorage, useSelf } from "@liveblocks/react";
import * as Tooltip from "~/components/ui/tooltip";
import { RiCloseLine } from "@remixicon/react";

interface LiveObject<T> {
  get<K extends keyof T>(key: K): T[K];
}

interface Layer {
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: ColorType | null;
}

interface BackgroundInfo {
  name: string;
  color: string;
}

// Вспомогательная функция для работы с LiveObject и обычными объектами
function getLayerProperty<T>(layer: LiveObject<T> | T, property: keyof T, defaultValue: T[keyof T]): T[keyof T] {
  if (!layer) return defaultValue;

  if ("get" in layer) {
    // Для LiveObject
    return layer.get(property);
  } else {
    // Для обычных объектов
    return layer[property];
  }
}

// Основной компонент для отображения информации о контрасте
interface ContrastDisplayProps {
  colorHex: string;
  layer: LiveObject<Layer> | Layer;
}

export const ContrastDisplay: React.FC<ContrastDisplayProps> = ({
  colorHex,
  layer,
}) => {
  const { roomColor } = useCanvas();
  const [backgroundInfo, setBackgroundInfo] = useState<BackgroundInfo | null>(null);

  // Получаем все слои
  const layers = useStorage((root) => root.layers) as Map<string, LiveObject<Layer>>;
  const layerIds = useStorage((root) => root.layerIds) as string[];
  const selectedId = useSelf((me) => me.presence.selection[0] ?? null);

  // Проверяем тип слоя - для изображений контраст не показываем
  const layerType = layer
    ? getLayerProperty<Layer>(layer, "type", LayerType.Rectangle)
    : null;

  // Определяем какой слой находится под выделенным слоем
  useEffect(() => {
    if (layerType === LayerType.Image) return;
    if (!selectedId || !layers || !layerIds || !layer) return;

    // По умолчанию это фон холста
    const canvasBackground = roomColor ? colorToCss(roomColor) : "#EFEFEF";
    let backgroundLayer: BackgroundInfo = { name: "холстом", color: canvasBackground };
    
    // Получаем координаты выбранного слоя
    const selectedLayer = layers.get(selectedId);
    if (!selectedLayer) {
      setBackgroundInfo(backgroundLayer);
      return;
    }
    
    // Получаем координаты выбранного слоя
    const selectedX = Number(getLayerProperty<Layer>(selectedLayer, "x", 0));
    const selectedY = Number(getLayerProperty<Layer>(selectedLayer, "y", 0));
    const selectedWidth = Number(getLayerProperty<Layer>(selectedLayer, "width", 0));
    const selectedHeight = Number(getLayerProperty<Layer>(selectedLayer, "height", 0));

    // Проверяем все слои и ищем те, что находятся под выбранным
    const centerX = selectedX + selectedWidth / 2;
    const centerY = selectedY + selectedHeight / 2;

    // Получаем z-порядок слоев
    const layerIdsArray = Array.isArray(layerIds) ? layerIds : [...layerIds] as string[];

    // Переменные для хранения найденных слоев
    let foundParentFrame: LiveObject<Layer> | Layer | null = null;
    let underlyingLayer: LiveObject<Layer> | Layer | null = null;

    // Перебираем в обратном порядке, чтобы начать с верхних слоев
    for (let i = layerIdsArray.length - 1; i >= 0; i--) {
      const id = layerIdsArray[i];
      if (id === selectedId) continue; // Пропускаем сам выбранный слой

      const curLayer = layers.get(id);
      if (!curLayer) continue;

      // Получаем координаты текущего слоя
      const curX = Number(getLayerProperty<Layer>(curLayer, "x", 0));
      const curY = Number(getLayerProperty<Layer>(curLayer, "y", 0));
      const curWidth = Number(getLayerProperty<Layer>(curLayer, "width", 0));
      const curHeight = Number(getLayerProperty<Layer>(curLayer, "height", 0));
      const curType = getLayerProperty<Layer>(
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
        underlyingLayer ??= curLayer;
      }
    }

    // Определяем приоритет отображения фона: 
    // 1. Слой под объектом
    // 2. Родительская рамка 
    // 3. Фон холста
    if (underlyingLayer) {
      const layerFill = getLayerProperty<Layer>(
        underlyingLayer,
        "fill",
        null,
      );
        
      if (layerFill) {
        let layerName = "объектом";
         
        const layerType = getLayerProperty<Layer>(
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
      const frameFill = getLayerProperty<Layer>(
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
  }, [selectedId, layers, layerIds, layer, roomColor, layerType]);

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
