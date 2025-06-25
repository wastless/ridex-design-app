/**
 * Корневой макет приложения
 * Определяет общую структуру для всех страниц, включая мета-теги, шрифты и базовые провайдеры
 */

import "~/styles/globals.css";
import { Inter } from "next/font/google";
import { type Metadata } from "next";
import { FontLoader } from "~/data/font-loader";
import ClientScripts from "~/lib/client/ClientScripts";
import { Providers } from "~/lib/client/Providers";

/**
 * Метаданные для всего приложения
 * Используются для SEO и отображения в браузере
 */
export const metadata: Metadata = {
  title: "Ridex Design App",
  description: "Design application for Ridex",
  icons: [{ rel: "icon", url: "/ridex-favicon.ico" }],
};

/**
 * Настройка основного шрифта приложения
 * Используется оптимизированная загрузка шрифта через next/font
 */
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial", "sans-serif"],
});

/**
 * Корневой компонент макета
 * Оборачивает все страницы приложения в необходимые контейнеры и провайдеры
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable}`}>
      <head>
        {/* Метатеги для контроля масштабирования и отображения на мобильных устройствах */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />

        {/* Базовые стили для предотвращения масштабирования и выделения */}
        <style>{`
          html, body {
            touch-action: none;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            overscroll-behavior: none;
          }
        `}</style>
      </head>
      <body className="overflow-hidden overscroll-none">
        {/* Провайдеры для управления состоянием приложения */}
        <Providers>
          {/* Скрипты для предотвращения масштабирования на клиенте */}
          <ClientScripts />
          {/* Загрузчик шрифтов для дизайн-системы */}
          <FontLoader />
          {/* Основное содержимое страницы */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
