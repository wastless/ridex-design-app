"use client";

/**
 * Компонент для отображения иерархической структуры слоев на холсте.
 * Поддерживает вложенные слои, различные типы элементов (фреймы, текст, изображения и т.д.),
 * а также интерактивное управление (выбор, разворачивание/сворачивание).
 * Обеспечивает синхронизацию с другими пользователями через Liveblocks.
 */

import React, { useState } from "react";
import { useStorage, useRoom } from "@liveblocks/react";
import type { LiveMap, LiveObject } from "@liveblocks/client";
import { Rectangle_16, Ellipse_16, Text_16, Frame_16, Image_16 } from "~/icon";
import LayerButton from "~/components/ui/layer-button";
import { LayerType } from "~/types";
import type { FrameLayer, Layer } from "~/types";
import { generateLayerName } from "~/utils";

// Тип для хранилища слоев, который может быть LiveMap или обычным Map
export type LayersStorage =
  | LiveMap<string, LiveObject<Layer>>
  | Map<string, Layer>
  | ReadonlyMap<string, Layer>
  | ReadonlyMap<string, LiveObject<Layer>>;

// Пропсы для компонента RenderLayersList
interface RenderLayersListProps {
  layerIds: readonly string[];      // Массив ID слоев
  layers: LayersStorage;            // Хранилище слоев
  selection: readonly string[];     // Массив выбранных слоев
  level?: number;                   // Уровень вложенности
  processedIds?: Set<string>;       // Множество обработанных ID
  roomId: string;                   // ID комнаты
}

// Рекурсивный компонент для отображения слоев с поддержкой вложенности
export const RenderLayersList: React.FC<RenderLayersListProps> = ({
  layerIds,
  layers,
  selection,
  level = 0,
  processedIds = new Set<string>(),
  roomId,
}) => {
  // Состояние для отслеживания развернутых слоев
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(() => {
    // Инициализация: все фреймы развернуты по умолчанию
    const initialExpanded = new Set<string>();

    // Вспомогательная функция для поиска всех фреймов и их разворачивания
    const findFramesRecursive = (
      ids: readonly string[],
      processed = new Set<string>(),
    ) => {
      ids.forEach((id) => {
        if (processed.has(id)) return;
        processed.add(id);

        const layer = layers?.get(id);
        if (!layer) return;

        // Проверяем тип слоя
        const layerType = "get" in layer ? layer.get("type") : layer.type;

        if (layerType === LayerType.Frame) {
          // Добавляем фрейм в множество развернутых
          initialExpanded.add(id);

          // Получаем дочерние ID и обрабатываем их (для вложенных фреймов)
          const childIds =
            "get" in layer
              ? (layer.toObject() as FrameLayer).childIds ?? []
              : (layer as FrameLayer).childIds ?? [];

          findFramesRecursive(childIds, processed);
        }
      });
    };

    // Начинаем с верхнеуровневых слоев
    findFramesRecursive(layerIds);

    return initialExpanded;
  });

  // Функция для переключения состояния развернутости слоя
  const toggleLayerExpanded = (layerId: string) => {
    setExpandedLayers((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(layerId)) {
        newExpanded.delete(layerId);
      } else {
        newExpanded.add(layerId);
      }
      return newExpanded;
    });
  };

  // Отображаем слои в обратном порядке (новые сверху) только для верхнего уровня
  const displayLayerIds = level === 0 ? [...layerIds].reverse() : layerIds;

  return (
    <div className="flex flex-col gap-1" style={{ paddingLeft: level * 16 }}>
      {displayLayerIds.map((id) => {
        // Пропускаем уже обработанные ID для избежания дублирования
        if (processedIds.has(id)) {
          const layer = layers?.get(id);
          if (!layer) return null;

          const isLiveObject = "get" in layer;
          const layerType = isLiveObject ? layer.get("type") : layer.type;

          // Если это не фрейм, пропускаем
          if (layerType !== LayerType.Frame) {
            return null;
          }
        }

        // Отмечаем как обработанный для избежания дубликатов
        const localProcessedIds = new Set(processedIds);
        localProcessedIds.add(id);

        const layer = layers?.get(id);
        if (!layer) return null;

        // Обработка свойств для прямых объектов и LiveObjects
        const isLiveObject = "get" in layer;
        const layerType = isLiveObject ? layer.get("type") : layer.type;

        // Получаем дочерние элементы, если это фрейм
        let childIds: readonly string[] = [];
        if (layerType === LayerType.Frame) {
          if (isLiveObject) {
            const frameData = layer.toObject() as FrameLayer;
            childIds = frameData.childIds ?? [];
          } else {
            childIds = (layer as FrameLayer).childIds ?? [];
          }
        }

        const hasChildren = childIds.length > 0;
        const isExpanded = expandedLayers.has(id);
        const isSelected = selection?.includes(id);

        let icon;
        let layerName = "";

        // Генерируем имя слоя на основе его типа и ID
        if (layerType !== undefined) {
          layerName = generateLayerName(id, layerType, roomId);
        }

        // Определяем иконку в зависимости от типа слоя
        if (layerType === LayerType.Rectangle) {
          icon = <Rectangle_16 className="color-icon-strong-950" />;
        } else if (layerType === LayerType.Ellipse) {
          icon = <Ellipse_16 className="color-icon-strong-950" />;
        } else if (layerType === LayerType.Path) {
          icon = (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className="text-text-strong-950"
            >
              <path
                d={((): string => {
                  // Проверяем, является ли слой PathLayer с точками
                  if (isLiveObject) {
                    const layerObj = layer.toObject();
                    if (
                      "points" in layerObj &&
                      Array.isArray(layerObj.points)
                    ) {
                      const points = layerObj.points;
                      const width = layer.get("width");
                      const height = layer.get("height");
                      return points
                        .map((point: number[], index: number) => {
                          const [x = 0, y = 0] = (point.length >= 2 ? point : [0, 0]) as [number, number];
                          const scaledX = (x / (width ?? 1)) * 10 + 3;
                          const scaledY = (y / (height ?? 1)) * 10 + 3;
                          return `${index === 0 ? "M" : "L"} ${scaledX} ${scaledY}`;
                        })
                        .join(" ");
                    }
                  } else if ("points" in layer && Array.isArray(layer.points)) {
                    const points = layer.points;
                    const width = layer.width;
                    const height = layer.height;
                    return points
                      .map((point: number[], index: number) => {
                        const [x = 0, y = 0] = (point.length >= 2 ? point : [0, 0]) as [number, number];
                        const scaledX = (x / (width ?? 1)) * 10 + 3;
                        const scaledY = (y / (height ?? 1)) * 10 + 3;
                        return `${index === 0 ? "M" : "L"} ${scaledX} ${scaledY}`;
                      })
                      .join(" ");
                  }
                  return "M0 0"; // Пустой путь по умолчанию
                })()}
                stroke="currentColor"
                fill="none"
                strokeWidth="1"
              />
            </svg>
          );
        } else if (layerType === LayerType.Text) {
          icon = <Text_16 className="color-icon-strong-950" />;

          // Безопасно получаем текстовое содержимое с проверкой типов
          const textContent = ((): string => {
            if (isLiveObject) {
              const layerObj = layer.toObject();
              return "text" in layerObj ? layerObj.text : "";
            } else if ("text" in layer) {
              return layer.text;
            }
            return "";
          })();

          // Используем текст как название, если он не пустой
          if (textContent.length > 0) {
            const singleLineText = textContent.split("\n").join(" ");
            if (singleLineText.length <= 20) {
              layerName = singleLineText;
            } else {
              const maxChars = 20;
              layerName = singleLineText.length > maxChars
                ? singleLineText.slice(0, maxChars) + "..."
                : singleLineText;
            }
          }
        } else if (layerType === LayerType.Frame) {
          icon = <Frame_16 className="text-white bg-primary-base rounded-[4px]" />;
        } else if (layerType === LayerType.Image) {
          icon = <Image_16 className="color-icon-strong-950" />;
          
          // Для слоя изображения используем короткое название с расширением
          layerName = layerName.replace('Image', 'image.jpg');
        }

        // Отладочный лог для фреймов и их дочерних элементов
        if (layerType === LayerType.Frame) {
          console.log(`Rendering Frame ${id} in tree, childIds:`, childIds);
        }

        return (
          <React.Fragment key={id}>
            <LayerButton
              layerId={id}
              text={layerName}
              isSelected={isSelected ?? false}
              icon={icon}
              hasChildren={hasChildren}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleLayerExpanded(id)}
            />

            {/* Рендерим дочерние элементы только если слой имеет детей и развернут */}
            {hasChildren && isExpanded && (
              <RenderLayersList
                layerIds={childIds}
                layers={layers}
                selection={selection}
                level={level + 1}
                processedIds={localProcessedIds}
                roomId={roomId}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Пропсы для компонента AllLayersTree
interface AllLayersTreeProps {
  layers: LayersStorage;            // Хранилище слоев
  selection: readonly string[];     // Массив выбранных слоев
}

// Компонент AllLayersTree для отображения всех слоев, включая вложенные
export const AllLayersTree: React.FC<AllLayersTreeProps> = ({
  layers,
  selection,
}) => {
  // Получаем все ID слоев из хранилища
  const layerIds = useStorage((root) => root.layerIds);
  const room = useRoom();
  const roomId = room.id;

  if (!layerIds) return null;

  // Отладочный лог для проверки начальных данных
  console.log("Top level layerIds:", [...layerIds]);

  return (
    <div className="flex flex-col gap-1">
      <RenderLayersList
        layerIds={layerIds}
        layers={layers}
        selection={selection}
        roomId={roomId}
      />
    </div>
  );
};

export default AllLayersTree;
