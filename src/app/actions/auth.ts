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
  console.log("authenticate function called");
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log(`Attempting to authenticate user: ${email}`);

    // Проверка существования пользователя в базе данных
    const user = await db.user.findUnique({ where: { email } });
    console.log(`User found in database: ${!!user}`);
    
    if (!user?.password) {
      console.log("User not found or has no password");
      return { email: "Пользователь не найден" };
    }

    // Проверка правильности пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`Password validation result: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      console.log("Invalid password");
      return { password: "Неверный пароль" };
    }

    // Выполнение входа в систему с расширенными параметрами для деплоя
    console.log("Attempting to sign in user:", email);
    
    try {
      // Пробуем выполнить вход с полными параметрами
      const result = await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
        redirect: true,
        callbackUrl: "/dashboard",
      });
      
      console.log("SignIn result:", result);
      
      // Если signIn не выполнил редирект автоматически, делаем его вручную
      console.log("Manual redirect to /dashboard");
      redirect("/dashboard");
      
    } catch (signInError) {
      console.error("SignIn error:", signInError);
      // Если произошла ошибка при входе, возможно, это связано с перенаправлением
      // В этом случае всё равно перенаправляем пользователя вручную
      console.log("Error during signIn, trying manual redirect");
      redirect("/dashboard");
    }
    
    // Этот код выполнится только если redirect не сработает
    return { success: true };
  } catch (error) {
    console.error("Authentication error:", error);
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
