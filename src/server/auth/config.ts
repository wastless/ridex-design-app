import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { env } from "~/env";
import bcrypt from "bcryptjs";
import { signInSchema } from "~/schemas";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

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
        name: {}, // Имя пользователя
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

          // Проверка соответствия пароля
          const passwordMatch = await bcrypt.compare(
            password,
            user?.password ?? "",
          );

          // Если пароль не совпадает, возвращаем null
          if (!passwordMatch) {
            return null;
          }

          // Возвращаем данные пользователя при успешной аутентификации
          return user;
        } catch (error) {
          // Log the error for debugging purposes
          console.error("Authentication error:", error);
          // In case of any error, return null
          return null;
        }
      },
    }),
  ],
  
  // Настройка типа сессии
  session: {
    strategy: "jwt", // Используем JWT для сессий
  },
  
  // Секретный ключ для JWT
  secret: env.AUTH_SECRET,
  
  // Настройка адаптера для хранения данных в базе через Prisma
  adapter: PrismaAdapter(db),
  
  // Функции обратного вызова для различных событий
  callbacks: {
    // Модификация данных сессии
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub, // Добавляем ID пользователя из токена в объект сессии
      },
    }),
  },
} satisfies NextAuthConfig;
