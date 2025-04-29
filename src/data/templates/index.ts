/**
 * Модуль экспорта шаблонов проектов
 *
 * Централизованный экспорт всех доступных шаблонов приложения.
 * Для добавления нового шаблона импортируйте его и добавьте в массив allTemplates.
 */

import type { Template } from "~/types";
import businessCardTemplate from "./business-card";
import socialPostTemplate from "./social-post";

/**
 * Массив всех доступных шаблонов в приложении
 */
const allTemplates: Template[] = [
  businessCardTemplate,
  socialPostTemplate,
  // Здесь можно добавить другие шаблоны при их создании
];

export default allTemplates;
