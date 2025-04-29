/**
 * Главная страница приложения
 * Содержит приветственное сообщение и кнопку для перехода к регистрации
 */

import * as Button from "~/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        {/* Заголовок с названием приложения */}
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Design <span className="text-[hsl(280,100%,70%)]">Ridex</span> App
        </h1>
        {/* Кнопка для перехода к регистрации */}
        <Button.Root variant="primary" mode="filled">
          <a href="/signup">Начать работу</a>
        </Button.Root>
      </div>
    </main>
  );
}
