import { useMutation } from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import {
  CanvasMode,
  EllipseLayer,
  LayerType,
  Point,
  RectangleLayer,
} from "~/types";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import {createLayer} from "~/components/canvas/helper/LayerFactory";

export function useCreateLayerFunctions() {
  const { canvasState, setState, MAX_LAYERS } = useCanvas();

  // Вставка слоя (фигуры или текста) одним кликом
  const insertLayerByClick = useMutation(
      ({ storage, setMyPresence }, point: Point, layerType: LayerType) => {
        const liveLayers = storage.get("layers");
        if (liveLayers.size >= MAX_LAYERS) return;

        const layerId = nanoid();
        let layer: LiveObject<any> | null = null;

        if (layerType === LayerType.Text) {
          // Текстовый блок авторасширяется
          layer = createLayer(layerType, point.x, point.y, 10, 20, "Введите текст...");
        } else {
          // Фигуры создаются с фиксированным размером
          const size = 100;
          layer = createLayer(layerType, point.x - size / 2, point.y - size / 2, size, size);
        }

        if (layer) {
          storage.get("layerIds").push(layerId);
          liveLayers.set(layerId, layer);
          setMyPresence({ selection: [layerId] }, { addToHistory: true });
        }

        setState({ mode: CanvasMode.None });
      },
      []
  );

  // Завершение рисования фигуры или текста (тянущийся клик)
  const insertLayerByDragging = useMutation(
      ({ storage, setMyPresence }, position: { x: number; y: number; width: number; height: number }) => {
        if (canvasState.mode !== CanvasMode.CreatingShape || !canvasState.origin || !canvasState.current) {
          return;
        }

        const liveLayers = storage.get("layers");
        if (liveLayers.size >= MAX_LAYERS) return;

        const layerId = nanoid();
        let layer: LiveObject<any> | null = null;

        if (canvasState.layerType === LayerType.Text) {
          // Текстовый блок с фиксированной шириной и переносом строк
          layer = createLayer(LayerType.Text, position.x, position.y, position.width, position.height, "Введите текст...");
        } else {
          layer = createLayer(canvasState.layerType, position.x, position.y, position.width, position.height);
        }

        if (layer) {
          storage.get("layerIds").push(layerId);
          liveLayers.set(layerId, layer);
          setMyPresence({ selection: [layerId] }, { addToHistory: true });
        }

        setState({ mode: CanvasMode.None });
      },
      [canvasState, setState]
  );

  return {
    insertLayerByClick,
    insertLayerByDragging,
  };
}
