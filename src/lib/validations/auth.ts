/**
 * Модуль с валидационными схемами для форм аутентификации
 * Использует библиотеку Zod для типизированной валидации данных
 */

import { object, string } from "zod";

/**
 * Схема валидации для регистрации нового пользователя
 * Проверяет корректность email, сложность пароля и наличие имени
 */
export const signUpSchema = object({
  email: string({ required_error: "Требуется email" }).email("Некорректный email"),
  password: string({ required_error: "Требуется пароль" })
    .min(8, "Пароль должен содержать не менее 8 символов")
    .max(32, "Пароль должен содержать не более 32 символов"),
  name: string({ required_error: "Требуется указать имя" }),
});

/**
 * Схема валидации для входа пользователя
 * Проверяет корректность email и наличие пароля
 */
export const signInSchema = object({
  email: string({ required_error: "Требуется email" }).email("Неверный email"),
  password: string({ required_error: "Требуется пароль" }),
}); 