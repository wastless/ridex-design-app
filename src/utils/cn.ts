/**
 * Утилиты для работы с CSS классами в Tailwind
 * Предоставляет функции для объединения и управления классами
 */

import { borderRadii, shadows, texts } from "../../tailwind.config.js";
import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

export { type ClassValue } from "clsx";

/**
 * Конфигурация для расширения tailwind-merge
 * Добавляет поддержку кастомных размеров текста, теней и границ
 */
export const twMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [
        {
          text: Object.keys(texts),
        },
      ],
      shadow: [
        {
          shadow: Object.keys(shadows),
        },
      ],
      rounded: [
        {
          rounded: Object.keys(borderRadii),
        },
      ],
    },
  },
};

// Создаем кастомную функцию слияния классов с нашей конфигурацией
const customTwMerge = extendTailwindMerge(twMergeConfig);

/**
 * Объединяет классы с использованием `clsx` и `tailwind-merge`
 * Используется в случаях возможных конфликтов классов Tailwind
 *
 * @param classes - Список классов или объектов условных классов
 * @returns Объединенная строка классов CSS без конфликтов
 */
export function cnExt(...classes: ClassValue[]) {
  return customTwMerge(clsx(...classes));
}

/**
 * Прямой экспорт функции `clsx` без обработки через `tailwind-merge`
 * Используется для простого объединения классов без разрешения конфликтов Tailwind
 */
export const cn = clsx;
