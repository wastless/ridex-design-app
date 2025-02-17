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
          position: { x: number; y: number; width?: number; height?: number }
      ) => {
        const liveLayers = storage.get("layers");

        if (liveLayers.size >= MAX_LAYERS) return;

        const layerId = nanoid();
        let layer: LiveObject<Layer> | null = null;
        const width = position.width || 100;
        const height = position.height || 100;

        if (layerType === LayerType.Rectangle) {
          layer = new LiveObject<RectangleLayer>({
            type: LayerType.Rectangle,
            x: position.x,
            y: position.y,
            width,
            height,
            fill: { r: 217, g: 217, b: 217 },
            stroke: { r: 217, g: 217, b: 217 },
            opacity: 100,
          });
        } else if (layerType === LayerType.Ellipse) {
          layer = new LiveObject<EllipseLayer>({
            type: LayerType.Ellipse,
            x: position.x,
            y: position.y,
            width,
            height,
            fill: { r: 217, g: 217, b: 217 },
            stroke: { r: 217, g: 217, b: 217 },
            opacity: 100,
          });
        }

        if (layer) {
          const liveLayerIds = storage.get("layerIds");
          liveLayerIds.push(layerId);
          liveLayers.set(layerId, layer);
          setMyPresence({ selection: [layerId] }, { addToHistory: true });
          setState({ mode: CanvasMode.None });
        }
      },
      [],
  );


  return { insertLayer };
}
