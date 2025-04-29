/**
 * Утилита для создания вариативных компонентов с Tailwind CSS
 * Предоставляет API для создания типизированных вариантов компонентов с помощью tailwind-variants
 */

import { createTV } from "tailwind-variants";

import { twMergeConfig } from "../utils/cn";

export type { VariantProps, ClassValue } from "tailwind-variants";

/**
 * Инициализированный экземпляр tailwind-variants с нашей конфигурацией
 * Используется для создания компонентов с различными вариантами стилей
 */
export const tv = createTV({
  twMergeConfig,
});
