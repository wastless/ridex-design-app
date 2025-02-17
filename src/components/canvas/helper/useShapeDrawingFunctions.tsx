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

export function useShapeDrawingFunctions() {
  const { canvasState, setState, MAX_LAYERS } = useCanvas();

  // Добавление фигуры при клике
  const insertShapeByClick = useMutation(
    ({ storage, setMyPresence }, point: Point, layerType: LayerType) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) return;

      const layerId = nanoid();
      let layer: LiveObject<RectangleLayer | EllipseLayer> | null = null;

      const size = 100; // Фиксированный размер

      // Центрируем фигуру относительно точки клика
      const x = point.x - size / 2;
      const y = point.y - size / 2;

      if (layerType === LayerType.Rectangle) {
        layer = new LiveObject<RectangleLayer>({
          type: LayerType.Rectangle,
          x,
          y,
          width: size,
          height: size,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      } else if (layerType === LayerType.Ellipse) {
        layer = new LiveObject<EllipseLayer>({
          type: LayerType.Ellipse,
          x,
          y,
          width: size,
          height: size,
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
      }

      setState({ mode: CanvasMode.None });
    },
    [],
  );
  // Начало создания фигуры по зажатию
  const startShapeDrawing = useMutation(
    (
      {},
      point: Point,
      layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text,
    ) => {
      setState({
        mode: CanvasMode.CreatingShape,
        origin: point,
        current: point,
        layerType: layerType,
        isClick: true,
        isShiftPressed: false,
        position: { x: point.x, y: point.y, width: 0, height: 0 },
      });
    },
    [],
  );

  // Обновление размеров фигуры в процессе рисования
  const continueShapeDrawing = useMutation(
    ({}, point: Point) => {
      if (canvasState.mode === CanvasMode.CreatingShape && canvasState.origin) {
        let width = Math.abs(point.x - canvasState.origin.x);
        let height = Math.abs(point.y - canvasState.origin.y);

        // Если Shift зажат, делаем квадрат
        if (canvasState.isShiftPressed) {
          const size = Math.max(width, height);
          width = size;
          height = size;
        }

        const x = Math.min(canvasState.origin.x, point.x);
        const y = Math.min(canvasState.origin.y, point.y);

        setState({
          ...canvasState,
          current: point,
          position: { x, y, width, height },
        });
      }
    },
    [canvasState],
  );

  // Завершение рисования фигуры и добавление ее на холст
  const insertShapeByDragging = useMutation(
    (
      { storage, setMyPresence },
      position: { x: number; y: number; width: number; height: number },
    ) => {
      if (
        canvasState.mode !== CanvasMode.CreatingShape ||
        !canvasState.origin ||
        !canvasState.current
      ) {
        return;
      }

      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) return;

      const x = Math.min(canvasState.origin.x, canvasState.current.x);
      const y = Math.min(canvasState.origin.y, canvasState.current.y);
      const width = Math.abs(canvasState.origin.x - canvasState.current.x);
      const height = Math.abs(canvasState.origin.y - canvasState.current.y);
      const layerId = nanoid();
      let layer: LiveObject<RectangleLayer | EllipseLayer> | null = null;

      if (canvasState.layerType === LayerType.Rectangle) {
        layer = new LiveObject<RectangleLayer>({
          type: LayerType.Rectangle,
          x,
          y,
          width,
          height,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      } else if (canvasState.layerType === LayerType.Ellipse) {
        layer = new LiveObject<EllipseLayer>({
          type: LayerType.Ellipse,
          x,
          y,
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
      }

      setState({ mode: CanvasMode.None });
    },
    [canvasState, setState],
  );

  return {
    insertShapeByClick,
    startShapeDrawing,
    continueShapeDrawing,
    insertShapeByDragging,
  };
}
