"use client";

/**
 * Хук для вычисления границ выделенных слоев
 * Используется для определения общей ограничивающей рамки для выделенных элементов
 */

import { useSelf, useStorage } from "@liveblocks/react";
import { shallow } from "@liveblocks/client";
import { LayerType } from "~/types";

/**
 * Хук для расчета общих границ всех выделенных слоев
 * @returns {Object | null} Объект с координатами и размерами общей ограничивающей рамки или null, если нет выделения
 */
export default function useSelectionBounds() {
  // Получаем текущее выделение пользователя
  const selection = useSelf((me) => me.presence.selection);

  return useStorage((root) => {
    // Получаем все выделенные слои
    const selectedLayers = selection
      ?.map((layerId) => root.layers.get(layerId)!)
      .filter(Boolean);

    // Если нет выделенных слоев, возвращаем null
    if (!selectedLayers || selectedLayers.length === 0) {
      return null;
    }

    // Вычисляем границы для каждого выделенного слоя
    const bounds = selectedLayers.map((layer) => {
      // Для текстовых слоев рассчитываем размеры на основе содержимого
      if (layer.type === LayerType.Text) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          // Устанавливаем параметры шрифта
          context.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;

          // Разбиваем текст на строки для расчета максимальной ширины
          const lines = layer.text.split("\n");
          const lineWidths = lines.map(
            (line) => context.measureText(line).width,
          );
          const maxWidth = Math.max(...lineWidths, 10); // Минимальная ширина 10px

          // Рассчитываем высоту на основе количества строк и межстрочного интервала
          const lineCount = lines.length;
          const height = Math.max(
            lineCount * layer.fontSize * layer.lineHeight,
            layer.fontSize, // Минимальная высота - размер шрифта
          );

          return {
            x: layer.x,
            y: layer.y,
            width: maxWidth,
            height: height,
          };
        }
      }

      // Для нетекстовых слоев используем стандартные размеры
      return {
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
      };
    });

    // Рассчитываем общую ограничивающую рамку, содержащую все выделенные слои
    const x = Math.min(...bounds.map((b) => b.x));
    const y = Math.min(...bounds.map((b) => b.y));
    const width = Math.max(...bounds.map((b) => b.x + b.width)) - x;
    const height = Math.max(...bounds.map((b) => b.y + b.height)) - y;

    return { x, y, width, height };
  }, shallow);
}
