import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  // Схема переменных среды на стороне сервера
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    LIVEBLOCKS_PUBLIC_KEY: z.string(),
    LIVEBLOCKS_SECRET_KEY: z.string(),
  },

  // Схема переменных среды на стороне клиента.
  // Чтобы предоставить доступ, добавьте к ним префикс `NEXT_PUBLIC_`
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  // Переменные среды, которые будут доступны на стороне сервера и клиента
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    LIVEBLOCKS_PUBLIC_KEY: process.env.LIVEBLOCKS_PUBLIC_KEY,
    LIVEBLOCKS_SECRET_KEY: process.env.LIVEBLOCKS_SECRET_KEY,
  },

  // Запустите `build` или `dev` с `SKIP_ENV_VALIDATION`, чтобы пропустить проверку env.
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  // Делает так, что пустые строки рассматриваются как неопределенные. `SOME_VAR: z.string()` и `SOME_VAR="` выдадут ошибку.
  emptyStringAsUndefined: true,
});