/**
 * Файл конфигурации переменных окружения
 * Обеспечивает проверку наличия и типов необходимых переменных окружения
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Создаем и экспортируем объект с переменными окружения
export const env = createEnv({
  // Серверные переменные окружения (не доступны в браузере)
  server: {
    // Секретный ключ для аутентификации (не обязателен в режиме разработки)
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    // Для обратной совместимости с NextAuth
    NEXTAUTH_SECRET: 
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    // URL приложения для NextAuth
    NEXTAUTH_URL:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    // URL для подключения к базе данных
    DATABASE_URL: z.string().url(),
    // Окружение приложения (разработка, тест, продакшн)
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // Ключи для Liveblocks (совместная работа)
    LIVEBLOCKS_PUBLIC_KEY: z.string(),
    LIVEBLOCKS_SECRET_KEY: z.string(),
    // Ключи для авторизации через GitHub
    GITHUB_ID: z.string(),
    GITHUB_SECRET: z.string(),
    // Ключи для авторизации через Google
    GOOGLE_ID: z.string(),
    GOOGLE_SECRET: z.string(),
  },

  // Клиентские переменные окружения (доступны в браузере)
  client: {},

  // Фактические значения переменных окружения
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    LIVEBLOCKS_PUBLIC_KEY: process.env.LIVEBLOCKS_PUBLIC_KEY,
    LIVEBLOCKS_SECRET_KEY: process.env.LIVEBLOCKS_SECRET_KEY,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  },
  // Пропуск валидации при установке SKIP_ENV_VALIDATION
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  // Пустые строки интерпретируются как undefined
  emptyStringAsUndefined: true,
});
