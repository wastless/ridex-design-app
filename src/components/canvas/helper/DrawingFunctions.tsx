"use client";

/**
 * Функциональность для рисования на холсте
 * Предоставляет инструменты для создания и добавления путей рисования на холст
 */

import { useMutation } from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import { CanvasMode, type Point } from "~/types";
import { penPointsToPathPayer } from "~/utils";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { useSelectionFunctions } from "~/components/canvas/helper/SelectionFunctions";
import type React from "react";

export function useDrawingFunctions() {
  const { canvasState, setState, MAX_LAYERS } = useCanvas();
  const { unselectLayers } = useSelectionFunctions();

  // Функция начала рисования
  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      // Сначала снимаем все выделения
      unselectLayers();

      // Создаем первую точку в черновике рисования
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: { r: 0, g: 0, b: 0 }, // Цвет по умолчанию - черный
      });
    },
    [],
  );

  // Функция продолжения рисования
  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence; // Получаем текущий черновик рисования

      // Проверка условий для продолжения рисования:
      // - режим должен быть Pencil (карандаш)
      // - должна быть нажата кнопка мыши (1 - левая кнопка)
      // - должен существовать черновик рисования
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft === null
      ) {
        return;
      }

      // Добавляем новую точку в черновик и обновляем позицию курсора
      setMyPresence({
        cursor: point,
        pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode],
  );

  // Функция завершения рисования и вставки пути
  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const liveLayers = storage.get("layers"); // Получаем слои из хранилища
      const { pencilDraft } = self.presence; // Получаем черновик из пользовательского присутствия

      // Проверяем условия для вставки пути:
      // - должен существовать черновик
      // - путь должен содержать минимум 2 точки (начало и конец)
      // - не должно быть превышено максимальное количество слоев
      if (
        pencilDraft === null ||
        pencilDraft.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null }); // Сбрасываем черновик
        return;
      }

      const id = nanoid(); // Генерируем уникальный id для нового слоя

      // Преобразуем точки в путь и создаем слой
      liveLayers.set(
        id,
        new LiveObject(penPointsToPathPayer(pencilDraft, { r: 0, g: 0, b: 0 })),
      );

      const liveLayerIds = storage.get("layerIds"); // Получаем список id слоев
      liveLayerIds.push(id); // Добавляем id нового слоя в список
      setMyPresence({ pencilDraft: null }); // Сбрасываем черновик
      setState({ mode: CanvasMode.Pencil }); // Оставляем режим карандаша активным
    },
    [setState],
  );

  return { startDrawing, continueDrawing, insertPath };
}
