/**
 * Модуль экспорта настроенного экземпляра NextAuth
 * Предоставляет основные функции для работы с аутентификацией
 */

import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

// Логирование для отладки
console.log("Creating NextAuth instance with config. AUTH_SECRET exists:", !!process.env.AUTH_SECRET);
console.log("NEXTAUTH_URL exists:", !!process.env.NEXTAUTH_URL);
console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);

// Создаем экземпляр NextAuth с нашей конфигурацией
const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

// Логирование успешного создания
console.log("NextAuth instance created successfully");

// Создаем функцию-обертку для auth с дополнительным логированием
const loggingAuth = async () => {
  console.log("Auth function called");
  try {
    const session = await uncachedAuth();
    console.log("Auth function result - session exists:", !!session);
    return session;
  } catch (error) {
    console.error("Error in auth function:", error);
    return null;
  }
};

// Кэшируем функцию auth для оптимизации производительности
const auth = cache(loggingAuth);

// Экспортируем все необходимые функции для использования в приложении
export { auth, handlers, signIn, signOut };