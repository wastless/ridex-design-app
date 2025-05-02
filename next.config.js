/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Отключаем переадресации с www на без www и наоборот
  // Это может помочь в разрешении проблем с перенаправлениями
  async redirects() {
    return [];
  },
  // Отключаем строгий режим для запросов в production
  reactStrictMode: false,
  
  // Настройки для работы с cookie и сессиями
  experimental: {
    serverActions: {
      // Увеличиваем время ожидания для server actions
      bodySizeLimit: '2mb',
    },
  },
};

export default config;
