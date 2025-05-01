/**
 * Модуль экспорта настроенного экземпляра NextAuth
 * Предоставляет основные функции для работы с аутентификацией
 */

import NextAuth from "next-auth";
import { cache } from "react";

import { nextAuthOptions } from "./options";

// Создаем экземпляр NextAuth с нашей конфигурацией
const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(nextAuthOptions);

// Кэшируем функцию auth для оптимизации производительности
const auth = cache(uncachedAuth);

// Экспортируем все необходимые функции для использования в приложении
export { auth, handlers, signIn, signOut };
