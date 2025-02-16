/*** Компонент для других утилит и функций ***/

import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { useMutation } from "@liveblocks/react";
import {
  CanvasMode,
  EllipseLayer,
  Layer,
  LayerType,
  Point,
  RectangleLayer,
  TextLayer,
} from "~/types";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";

export function useCanvasUtilities() {
  const { setState, MAX_LAYERS } = useCanvas();

  // Функция добавления нового слоя
  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text,
      position: Point,
    ) => {
      const liveLayers = storage.get("layers"); // Получаем слои из хранилища

      // Проверка на максимальное количество слоев
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds"); // Создаем новый слой
      const layerId = nanoid(); // Генерируем уникальный id для слоя
      let layer: LiveObject<Layer> | null = null; // Инициализируем переменную слоя для дальнейшего добавления в хранилище

      // В зависимости от типа слоя создаем объект с начальными свойствами
      if (layerType === LayerType.Rectangle) {
        layer = new LiveObject<RectangleLayer>({
          type: LayerType.Rectangle,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      } else if (layerType === LayerType.Ellipse) {
        layer = new LiveObject<EllipseLayer>({
          type: LayerType.Ellipse,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      } else if (layerType === LayerType.Text) {
        layer = new LiveObject<TextLayer>({
          type: LayerType.Text,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fontSize: 16,
          text: "Text",
          fontWeight: 400,
          fontFamily: "Inter",
          stroke: null,
          fill: { r: 0, g: 0, b: 0 },
          opacity: 100,
        });
      }

      // Если слой создан, добавляем его в хранилище
      if (layer) {
        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);

        setMyPresence({ selection: [layerId] }, { addToHistory: true }); // Обновляем изменения в хранилище
        setState({ mode: CanvasMode.None }); // Сбрасываем режим холста
      }
    },
    [],
  );

  return { insertLayer };
}
