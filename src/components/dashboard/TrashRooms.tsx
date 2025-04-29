"use client";

/**
 * Компонент корзины с удаленными проектами
 * Позволяет просматривать удаленные проекты и восстанавливать их при необходимости
 */

import { useUser } from "~/hooks/use-user";

/**
 * Компонент отображения удаленных проектов
 * Показывает список проектов, которые были удалены пользователем
 */
export default function TrashRooms() {
  // Получаем данные пользователя из контекста
  const user = useUser();

  return (
    <div className="flex flex-col p-8">
      <h1 className="text-title-h6 text-text-strong-950">Корзина</h1>
      {/* Здесь будет список удаленных проектов */}
    </div>
  );
}
