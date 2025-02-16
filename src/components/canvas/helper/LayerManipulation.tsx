import { useCallback } from "react";
import {CanvasMode, Point, Side, XYWH} from "~/types";
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
      }));
    },
    [setState, history],
  );

  // Функция изменения размера слоя
  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      // Проверка на режим изменения размера
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      // Вычисление новых границ слоя
      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );

      const liveLayers = storage.get("layers"); // Получаем слои из хранилища

      // Обновляем границы выделенных слоев, если они есть в хранилище и есть выделенные слои
      if (self.presence.selection.length > 0) {
        const layer = liveLayers.get(self.presence.selection[0]!);
        if (layer) {
          layer.update(bounds); // Обновляем границы слоя
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
