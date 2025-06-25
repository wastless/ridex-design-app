/**
 * Главная страница приложения
 * Содержит приветственное сообщение и кнопку для перехода к регистрации
 * Автоматически перенаправляет авторизованных пользователей на dashboard
 */

import * as Button from "~/components/ui/button";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // Получаем сессию пользователя, если она есть
  const session = await auth();
  
  // Перенаправляем авторизованных пользователей на dashboard
  if (session?.user) {
    console.log("User is authenticated, redirecting to dashboard");
    redirect('/dashboard');
    return null; // Код не выполнится после redirect, но нужен для типизации
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        {/* Заголовок с названием приложения */}
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Design <span className="text-[hsl(280,100%,70%)]">Ridex</span> App
        </h1>
        {/* Кнопки для перехода к регистрации или входу */}
        <div className="flex gap-4">
          <Button.Root variant="primary" mode="filled">
            <a href="/signup">Регистрация</a>
          </Button.Root>
          <Button.Root variant="primary" mode="stroke">
            <a href="/signin">Вход</a>
          </Button.Root>
        </div>
      </div>
    </main>
  );
}
