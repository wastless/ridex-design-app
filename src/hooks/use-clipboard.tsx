"use client";

/**
 * Хук для работы с буфером обмена в редакторе
 * Позволяет копировать, вырезать и вставлять слои
 */

import { useMutation, useSelf, useStorage } from "@liveblocks/react";
import { nanoid } from "nanoid";
import { Layer } from "~/types";
import { LiveObject } from "@liveblocks/client";

/**
 * Хук для работы с буфером обмена (копирование, вставка, вырезание слоев)
 * @returns {Object} Объект с функциями copy, cut и paste
 */
export default function useClipboard() {
  // Получаем текущее выделение пользователя
  const selection = useSelf((me) => me.presence.selection);

  /**
   * Копирование выделенных слоев в буфер обмена
   */
  const copy = useMutation(
    ({ storage }) => {
      const liveLayers = storage.get("layers");
      const selectedLayers = selection
        ?.map((id) => {
          const layer = liveLayers.get(id);
          return layer ? layer.toImmutable() : null;
        })
        .filter(Boolean) as Layer[];

      // Сохраняем выделенные слои в буфер обмена
      storage.set("clipboard", selectedLayers);
    },
    [selection],
  );

  /**
   * Вырезание выделенных слоев в буфер обмена
   * Копирует слои в буфер и удаляет их с холста
   */
  const cut = useMutation(
    ({ storage }) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      const selectedLayers = selection
        ?.map((id) => {
          const layer = liveLayers.get(id);
          return layer ? layer.toImmutable() : null;
        })
        .filter(Boolean) as Layer[];

      // Сохраняем вырезанные слои в буфер обмена
      storage.set("clipboard", selectedLayers);

      // Удаляем вырезанные слои с холста
      for (const id of selection ?? []) {
        liveLayers.delete(id);
        const index = liveLayerIds.indexOf(id);
        if (index !== -1) {
          liveLayerIds.delete(index);
        }
      }
    },
    [selection],
  );

  /**
   * Вставка слоев из буфера обмена на холст
   * Создает новые слои со смещением от оригиналов
   */
  const paste = useMutation(
    ({ storage, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      const clipboard = storage.get("clipboard") as Layer[] | undefined;

      // Проверяем наличие элементов в буфере обмена
      if (!clipboard || clipboard.length === 0) return;

      // Создаем новые идентификаторы для вставляемых слоев
      const newIds = clipboard.map(() => nanoid());

      // Добавляем вставляемые слои с новыми идентификаторами и смещенными координатами
      clipboard.forEach((layer, index) => {
        const newId = newIds[index];
        if (newId) {
          // Создаем новый слой со смещенными координатами
          const offsetLayer = {
            ...layer,
            x: layer.x + 20, // Смещение на 20 пикселей
            y: layer.y + 20,
          };
          liveLayers.set(newId, new LiveObject(offsetLayer));
          liveLayerIds.push(newId);
        }
      });

      // Обновляем выделение на новые вставленные слои
      setMyPresence({ selection: newIds }, { addToHistory: true });
    },
    [selection],
  );

  return { copy, cut, paste };
}
