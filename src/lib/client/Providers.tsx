"use client";

/**
 * Компонент для глобальных провайдеров приложения
 * Предоставляет доступ к сессии пользователя во всех компонентах приложения через контекст Next-Auth
 * Все провайдеры состояния приложения должны быть добавлены здесь для глобального доступа
 */

import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";

/**
 * Компонент-обертка для провайдеров состояния приложения
 * Оборачивает приложение в необходимые контексты для доступа к глобальному состоянию
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты (основное содержимое приложения)
 * @returns {React.ReactElement} Обернутое в провайдеры дерево компонентов
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Состояние для отслеживания загрузки на клиентской стороне
  const [isClient, setIsClient] = useState(false);

  // Эффект выполняется только на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  // На сервере или во время клиентской гидратации отрисовываем провайдер по умолчанию
  if (!isClient) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  // На клиенте отрисовываем провайдер с расширенными настройками
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Обновлять каждые 5 минут
      refetchOnWindowFocus={true} // Обновлять при фокусе окна
    >
      {children}
    </SessionProvider>
  );
}
