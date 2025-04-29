import { object, string } from "zod";

export const signUpSchema = object({
  email: string({ required_error: "Требуется email" }).email("Неверный email"),
  password: string({ required_error: "Требуется пароль" })
    .min(8, "Пароль должен содержать не менее 8 символов")
    .max(32, "Пароль должен содержать не более 32 символов"),
  name: string({ required_error: "Требуется указать имя" }),
});

export const signInSchema = object({
  email: string({ required_error: "Требуется email" }).email("Неверный email"),
  password: string({ required_error: "Требуется пароль" }),
});
