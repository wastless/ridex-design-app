"use client";

/**
 * Компонент для глобальных провайдеров приложения
 * Предоставляет доступ к сессии пользователя во всех компонентах приложения через контекст Next-Auth
 * Все провайдеры состояния приложения должны быть добавлены здесь для глобального доступа
 */

import { SessionProvider } from "next-auth/react";

/**
 * Компонент-обертка для провайдеров состояния приложения
 * Оборачивает приложение в необходимые контексты для доступа к глобальному состоянию
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты (основное содержимое приложения)
 * @returns {React.ReactElement} Обернутое в провайдеры дерево компонентов
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
