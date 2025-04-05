import { useCallback } from "react";
import { CanvasMode, type Point, type Side, type XYWH } from "~/types";
import { useMutation } from "@liveblocks/react";
import { resizeBounds } from "~/utils";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";

export function useLayerManipulation() {
  const { canvasState, setState, history } = useCanvas();

  // Обработчик нажатий на маркеры изменения размера
  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setState((prev) => ({
        ...prev,
        mode: CanvasMode.Resizing,
        initialBounds, // Запоминает начальные границы элементы
        corner, // Запоминает угол, с которого началось изменение размера
        isShiftPressed: false,
      }));
    },
    [setState, history],
  );

  // Функция изменения размера слоя
    const resizeSelectedLayer = useMutation(
        ({ storage, self }, point: Point) => {
            // Check if the mode is resizing
            if (canvasState.mode !== CanvasMode.Resizing) {
                return;
            }

            // Calculate new bounds of the layer
            const bounds = resizeBounds(
                canvasState.initialBounds,
                canvasState.corner,
                point,
                canvasState.isShiftPressed
            );

            const liveLayers = storage.get("layers"); // Get layers from storage

            // Update bounds of the selected layers if they exist in storage and are selected
            if (self.presence.selection.length > 0) {
                const layer = liveLayers.get(self.presence.selection[0]!);
                if (layer) {
                    layer.update(bounds); // Update layer bounds
                }
            }
        },
        [canvasState],
    );

  // Функция перемещения выделенных слоев
  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      setState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );

  return {
    onResizeHandlePointerDown,
    resizeSelectedLayer,
    translateSelectedLayers,
  };
}
