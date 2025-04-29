"use client";

import React, { useState, useEffect } from "react";
import {
  colorToCss,
  calculateAPCAContrast,
  evaluateAPCAContrast,
} from "~/utils";
import type { Layer as BaseLayer, Color } from "~/types";
import { LayerType } from "~/types";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { useStorage, useSelf } from "@liveblocks/react";
import * as Tooltip from "~/components/ui/tooltip";
import { RiCloseLine } from "@remixicon/react";

interface LiveObject<T> {
  get<K extends keyof T>(key: K): T[K];
}

type LayerWithFill = Extract<BaseLayer, { fill: Color | null }>;
type Layer = BaseLayer;

interface BackgroundInfo {
  name: string;
  color: string;
}

function isLiveObject<T>(obj: LiveObject<T> | T): obj is LiveObject<T> {
  return typeof obj === 'object' && obj !== null && 'get' in obj && typeof obj.get === 'function';
}

function getLayerProperty<T extends Layer, K extends keyof T>(
  layer: LiveObject<T> | T,
  property: K
): T[K] | undefined {
  if (!layer) return undefined;

  if (isLiveObject(layer)) {
    return layer.get(property);
  }
  return layer[property];
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

  // Get the layer object from storage if a layer is selected
  const layers = useStorage((root) => root.layers);
  const layerIds = useStorage((root) => root.layerIds);
  const selectedId = useSelf((me) => me.presence.selection[0] ?? null);

  // Проверяем тип слоя - для изображений контраст не показываем
  const layerType = getLayerProperty(layer, "type");

  // Определяем какой слой находится под выделенным слоем
  useEffect(() => {
    if (layerType === LayerType.Image) return;
    if (!selectedId || !layers || !layerIds || !layer) return;

    // По умолчанию это фон холста
    const canvasBackground = roomColor ? colorToCss(roomColor) : "#EFEFEF";
    let backgroundLayer: BackgroundInfo = { name: "холстом", color: canvasBackground };
    
    // Получаем координаты выбранного слоя
    const selectedLayer = selectedId ? layers.get(selectedId) : undefined;
    if (!selectedLayer) {
      setBackgroundInfo(backgroundLayer);
      return;
    }
    
    // Получаем координаты выбранного слоя
    const selectedX = Number(getLayerProperty(selectedLayer, "x") ?? 0);
    const selectedY = Number(getLayerProperty(selectedLayer, "y") ?? 0);
    const selectedWidth = Number(getLayerProperty(selectedLayer, "width") ?? 0);
    const selectedHeight = Number(getLayerProperty(selectedLayer, "height") ?? 0);

    // Проверяем все слои и ищем те, что находятся под выбранным
    const centerX = selectedX + selectedWidth / 2;
    const centerY = selectedY + selectedHeight / 2;

    // Получаем z-порядок слоев
    const layerIdsArray = Array.from(layerIds);

    // Переменные для хранения найденных слоев
    let foundParentFrame: LiveObject<Layer> | Layer | null = null;
    let underlyingLayer: LiveObject<Layer> | Layer | null = null;

    // Перебираем в обратном порядке, чтобы начать с верхних слоев
    for (let i = layerIdsArray.length - 1; i >= 0; i--) {
      const id = layerIdsArray[i];
      if (id === selectedId) continue; // Пропускаем сам выбранный слой

      const curLayer = id ? layers.get(id) : undefined;
      if (!curLayer) continue;

      // Получаем координаты текущего слоя
      const curX = Number(getLayerProperty(curLayer, "x") ?? 0);
      const curY = Number(getLayerProperty(curLayer, "y") ?? 0);
      const curWidth = Number(getLayerProperty(curLayer, "width") ?? 0);
      const curHeight = Number(getLayerProperty(curLayer, "height") ?? 0);
      const curType = getLayerProperty(curLayer, "type");

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
      const layerWithFill = layer;
      const layerFill = getLayerProperty(layerWithFill as LayerWithFill, "fill" as keyof LayerWithFill);
        
      if (layerFill) {
        let layerName = "объектом";
         
        const layerType = getLayerProperty(layerWithFill, "type");
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
          color: colorToCss(layerFill as Color),
        };
      }
    } else if (foundParentFrame) {
      const frameWithFill = foundParentFrame as LiveObject<LayerWithFill> | LayerWithFill;
      const frameFill = getLayerProperty(frameWithFill, "fill");
        
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
