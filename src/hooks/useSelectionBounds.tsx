/*** Хук для вычисления границ выделенных слоев ***/

import { shallow, useSelf, useStorage } from "@liveblocks/react";
import { Layer, XYWH } from "~/types";

function boundingBox(layers: Layer[]): XYWH | null {
  const first = layers[0];
  if (!first) return null;

  // Инициализируем границы первого слоя
  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  // Проходим по всем слоям, чтобы найти границы выделения
  for (let i = 1; i < layers.length; i++) {
    const { x, y, width, height } = layers[i]!;

    if (left > x) {left = x;} // Находим левую границу
    if (right < x + width) {right = x + width;} // Находим правую границу
    if (top > y) {top = y;} // Находим верхнюю границу
    if (bottom < y + height) {bottom = y + height;} // Находим нижнюю границу
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

export default function useSelectionBounds() {
  const selection = useSelf((me) => me.presence.selection); // Получаем выбранные слои
  return useStorage((root) => {
    const seletedLayers = selection
      ?.map((layerId) => root.layers.get(layerId)!)
      .filter(Boolean);

    // Вычисляем границы выделенных слоев
    return boundingBox(seletedLayers ?? []);
  }, shallow);
}
