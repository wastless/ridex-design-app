"use server";

import { ZodError } from "zod";
import { db } from "~/server/db";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "~/server/auth";
import { AuthError } from "next-auth";
import {signUpSchema} from "~/shemas";

// Функция для выхода из системы
export async function signout() {
    await signOut();
}

// Функция для аутентификации пользователя
export async function authenticate(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Попытка авторизации пользователя
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return { email: "Пользователь не найден" };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { password: "Неверный пароль" };
        }

        await signIn("credentials", formData);
    } catch (error) {
        if (error instanceof AuthError) {
            const errorMessage = error.type === "CredentialsSignin"
                ? "Недействительные учетные данные"
                : "Что-то пошло не так";
            return { error: errorMessage };
        }
        throw error;
    }
}

// Функция для регистрации нового пользователя
export async function register(formData: FormData) {
    try {
        const { name, email, password } = await signUpSchema.parseAsync({
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
        });

        const user = await db.user.findUnique({ where: { email } });
        if (user) {
            return { email: "Пользователь с таким email уже существует" };
        }

        const hash = await bcrypt.hash(password, 10);

        await db.user.create({
            data: { name, email, password: hash },
        });

        return { success: true };

    } catch (error) {
        if (error instanceof ZodError) {
            return error.flatten().fieldErrors;
        }
        console.error(error);
        return "Произошла ошибка при регистрации";
    }
}