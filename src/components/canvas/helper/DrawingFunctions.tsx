/*** Компонент для функций рисования ***/

import { useMutation } from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import { CanvasMode, Point } from "~/types";
import { penPointsToPathPayer } from "~/utils";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { useSelectionFunctions } from "~/components/canvas/helper/SelectionFunctions";

export function useDrawingFunctions() {
  const { canvasState, setState, MAX_LAYERS } = useCanvas();
  const { unselectLayers } = useSelectionFunctions();

  // Функция начала рисования
  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      unselectLayers();
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]], // Сохраняем первую точку в черновике
        penColor: { r: 0, g: 0, b: 0 },
      });
    },
    [],
  );

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence; // Получаем текущий черновик

      // Проверка условий для продолжения рисования
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft === null
      ) {
        return;
      }

      // Добавляем новую точку в черновик
      setMyPresence({
        cursor: point,
        pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode],
  );

  // Функция завершения рисования и вставки пути
  const insertPath = useMutation(({ storage, self, setMyPresence }) => {
    const liveLayers = storage.get("layers"); // Получаем слои из хранилища
    const { pencilDraft } = self.presence; // Получаем черновик из хранилища

    // Проверка условий для вставки пути
    if (
      pencilDraft === null ||
      pencilDraft.length < 2 ||
      liveLayers.size >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null }); // Сбрасываем черновик
      return;
    }

    const id = nanoid(); // Генерируем уникальный id для нового слоя

    // Функция преобразования точек в путь
    liveLayers.set(
      id,
      new LiveObject(penPointsToPathPayer(pencilDraft, { r: 0, g: 0, b: 0 })),
    );

    const liveLayerIds = storage.get("layerIds"); // Получаем id слоев из хранилища
    liveLayerIds.push(id); // Добавляем id нового слоя в хранилище
    setMyPresence({ pencilDraft: null }); // Сбрасываем черновик
    setState({ mode: CanvasMode.Pencil }); // Сбрасываем режим холста
  }, []);

  return { startDrawing, continueDrawing, insertPath };
}
