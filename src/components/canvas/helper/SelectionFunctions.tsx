/*** Компонент для функций выбора ***/

import { useMutation } from "@liveblocks/react";
import { useCallback } from "react";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { CanvasMode, type Point } from "~/types";
import { findIntersectionLayersWithRectangle } from "~/utils";

export function useSelectionFunctions() {
  const { layerIds, setState } = useCanvas();

  // Функция сброса выделения слоев
  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  // Функция инициализации множественного выделения
  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    // Проверяем, что разница между начальной и текущей точкой больше 5
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setState({ mode: CanvasMode.SelectionNet, origin, current });
    }
  }, [setState]);

  // Функция вычисления слоев внутри прямоугольной области
  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      if (layerIds) {
        const layers = storage.get("layers").toImmutable(); // Получаем слои из хранилища
        // Обновляем состояние, сохраняя границы выделения
        setState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        });
        // Вычисляем слои, которые внутри прямоугольной области
        const ids = findIntersectionLayersWithRectangle(
          layerIds,
          layers,
          origin,
          current,
        );
        setMyPresence({ selection: ids }); // Обновляем выделение
      }
    },
    [layerIds],
  );

  return { unselectLayers, startMultiSelection, updateSelectionNet };
}
