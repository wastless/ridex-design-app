"use client";

/**
 * Хук для удаления выделенных слоев с холста
 * Позволяет удалять все выделенные пользователем слои и обновлять состояние
 */

import { useMutation, useSelf } from "@liveblocks/react";

/**
 * Хук для удаления выделенных слоев с холста
 * @returns {Function} Функция для удаления всех выделенных слоев
 */
export default function useDeleteLayers() {
  // Получаем список выбранных слоев
  const selection = useSelf((me) => me.presence.selection);

  return useMutation(
    ({ storage, setMyPresence }) => {
      // Получаем коллекции слоев и их идентификаторов
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");

      // Удаляем все выбранные слои
      for (const id of selection ?? []) {
        // Удаляем сам слой
        liveLayers.delete(id);

        // Удаляем идентификатор слоя из списка
        const index = liveLayerIds.indexOf(id);
        if (index !== -1) {
          liveLayerIds.delete(index);
        }
      }

      // Очищаем выделение и записываем действие в историю
      setMyPresence({ selection: [] }, { addToHistory: true });
    },
    [selection],
  );
}
