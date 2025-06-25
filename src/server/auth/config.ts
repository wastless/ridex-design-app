/**
 * Модуль конфигурации NextAuth для системы аутентификации
 * Определяет настройки провайдеров, сессий и адаптера базы данных
 */

import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { signInSchema } from "~/lib/validations/auth";
import { env } from "~/env";

/**
 * Расширение типа сессии NextAuth
 * Добавляет поле ID пользователя в объект сессии
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Определяем протокол и домен для безопасной работы с cookies
const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

/**
 * Основная конфигурация NextAuth
 * Содержит настройки провайдеров, сессий и колбэков
 */
export const authConfig = {
  // Настройка провайдеров аутентификации
  providers: [
    // Аутентификация через GitHub
    GitHub({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
    
    // Аутентификация через Google
    Google({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
    }),
    
    // Аутентификация через учетные данные (email/пароль)
    Credentials({
      credentials: {
        email: {}, // Email пользователя
        password: {}, // Пароль пользователя
      },
      
      // Функция проверки учетных данных
      authorize: async (credentials) => {
        try {
          // Валидация учетных данных через схему Zod
          const { email, password } = await signInSchema.parseAsync(credentials);

          // Поиск пользователя в базе данных
          const user = await db.user.findUnique({
            where: {
              email: email,
            },
          });

          console.log("User found for login:", !!user);

          // Проверка соответствия пароля
          const passwordMatch = await bcrypt.compare(
            password,
            user?.password ?? "",
          );

          console.log("Password match:", passwordMatch);

          // Если пароль не совпадает, возвращаем null
          if (!passwordMatch) {
            return null;
          }

          // Возвращаем данные пользователя при успешной аутентификации
          return user;
        } catch (error) {
          // В случае любой ошибки возвращаем null
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  
  // Настройка типа сессии и максимального времени жизни
  session: {
    strategy: "jwt", // Используем JWT для сессий
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  
  // Базовый URL для перенаправлений
  pages: {
    signIn: '/signin',
    signOut: '/signin',
    error: '/signin',
  },

  // Расширенные настройки для cookie в деплое
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        // Не устанавливаем domain, чтобы использовался текущий домен
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true, 
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  
  // Настройка адаптера для хранения данных в базе через Prisma
  adapter: PrismaAdapter(db),
  
  // Функции обратного вызова для различных событий
  callbacks: {
    // Модификация JWT токена
    jwt: ({ token, user }) => {
      // Логгируем для отладки
      console.log("JWT callback - token exists:", !!token);
      console.log("JWT callback - user exists:", !!user);
      
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        console.log("Setting JWT token with user data:", token);
      }
      return token;
    },
    
    // Модификация данных сессии
    session: ({ session, token }) => {
      console.log("Session callback - token exists:", !!token);
      console.log("Session callback - session exists:", !!session);
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub, // Добавляем ID пользователя из токена в объект сессии
        },
      };
    },
    
    // Разрешаем все авторизованные запросы
    authorized: ({ auth }) => {
      return !!auth?.user;
    },
    
    // Обработка редиректов после входа
    redirect: ({ url, baseUrl }) => {
      // Если URL начинается с базового URL, значит это внутренний редирект - разрешаем
      if (url.startsWith(baseUrl)) {
        console.log("Internal redirect to:", url);
        return url;
      }
      // Если URL начинается с '/', это относительный путь - добавляем базовый URL
      else if (url.startsWith("/")) {
        console.log("Relative redirect to:", `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      // В противном случае возвращаем на базовый URL (домашняя страница)
      console.log("External redirect, returning to base URL:", baseUrl);
      return baseUrl;
    }
  },
  
  // Использование JWT секрета из переменных окружения
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  
  // Явное указание доверенных хостов
  trustHost: true,
} satisfies NextAuthConfig;

