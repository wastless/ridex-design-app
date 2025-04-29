/**
 * API-маршрут для аутентификации через NextAuth
 * Обрабатывает запросы для входа/выхода пользователя и управления сессиями
 *
 * Экспортирует обработчики GET и POST запросов из NextAuth
 */

import { handlers } from "~/server/auth";

export const { GET, POST } = handlers;
