/**
 * API-маршрут для получения доступных шаблонов проекта
 * Возвращает список всех предустановленных шаблонов дизайна
 */

import { NextResponse } from "next/server";
import allTemplates from "~/data/templates";

/**
 * Обработчик GET-запросов для получения шаблонов
 * @returns {NextResponse} JSON-ответ со списком шаблонов или сообщением об ошибке
 */
export async function GET() {
  try {
    // Возвращаем все доступные шаблоны в формате JSON
    return NextResponse.json(allTemplates);
  } catch (error) {
    // Логирование ошибки для отладки
    console.error("Ошибка при получении шаблонов:", error);

    // Возвращаем сообщение об ошибке с кодом 500
    return NextResponse.json(
      { error: "Не удалось получить шаблоны" },
      { status: 500 },
    );
  }
}
