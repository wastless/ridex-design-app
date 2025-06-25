"use server";

/**
 * Модуль содержит функции для аутентификации и регистрации пользователей
 * Включает методы для входа, выхода и создания новой учетной записи
 */

import { ZodError } from "zod";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "~/server/auth";
import { AuthError } from "next-auth";
import { signUpSchema } from "~/lib/validations";
import { redirect } from "next/navigation";

/**
 * Функция для выхода пользователя из системы
 * Вызывает стандартный метод signOut из NextAuth
 */
export async function signout() {
  await signOut();
}

/**
 * Функция для аутентификации пользователя
 * @param {FormData} formData - Данные формы с email и паролем
 * @returns {Object|undefined} - Объект с ошибкой или undefined при успешной аутентификации
 */
export async function authenticate(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Проверка существования пользователя в базе данных
    const user = await db.user.findUnique({ where: { email } });
    if (!user?.password) {
      return { email: "Пользователь не найден" };
    }

    // Проверка правильности пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { password: "Неверный пароль" };
    }

    try {
      // Выполняем авторизацию с возможностью автоматического редиректа
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      });
      
      // Если авторедирект не сработал, делаем его вручную
      redirect("/dashboard");
    } catch (signInError) {
      // Если произошла ошибка с перенаправлением, но вход успешен, 
      // всё равно перенаправляем вручную
      if (signInError instanceof Error && signInError.message.includes("NEXT_REDIRECT")) {
        throw signInError; // пробрасываем ошибку редиректа, она обрабатывается Next.js
      }
      
      // В случае других ошибок показываем сообщение
      return { error: "Ошибка при входе в систему" };
    }
  } catch (error) {
    // Пропускаем ошибки редиректа
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    
    // Обрабатываем ошибки авторизации
    if (error instanceof AuthError) {
      const errorMessage =
        error.type === "CredentialsSignin"
          ? "Недействительные учетные данные"
          : "Что-то пошло не так";
      return { error: errorMessage };
    }
    throw error; // Пробрасываем неизвестные ошибки дальше
  }
}

/**
 * Функция для регистрации нового пользователя
 * @param {FormData} formData - Данные формы с именем, email и паролем
 * @returns {Object} - Объект с результатом регистрации или ошибками
 */
export async function register(formData: FormData) {
  try {
    // Валидация данных формы с помощью Zod
    const { name, email, password } = await signUpSchema.parseAsync({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Проверка, существует ли уже пользователь с таким email
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      return { email: "Пользователь с таким email уже существует" };
    }

    // Хеширование пароля для безопасного хранения
    const hash = await bcrypt.hash(password, 10);

    // Создание нового пользователя в базе данных
    await db.user.create({
      data: { name, email, password: hash },
    });

    return { success: true };
  } catch (error) {
    // Обработка ошибок валидации
    if (error instanceof ZodError) {
      return error.flatten().fieldErrors;
    }
    // Логирование непредвиденных ошибок
    console.error(error);
    return "Произошла ошибка при регистрации";
  }
}
