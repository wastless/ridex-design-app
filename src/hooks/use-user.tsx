"use client";

/**
 * Хук для работы с данными пользователя в приложении
 * Предоставляет доступ к информации о пользователе и его проектах через React Context API
 */

import { createContext, useContext, type ReactNode } from "react";

/**
 * Тип данных пользователя, хранящихся в контексте
 */
export interface UserContextType {
  id?: string; // Уникальный идентификатор пользователя
  email: string; // Email пользователя
  name: string | null; // Имя пользователя (может быть не указано)
  image: string | null; // URL аватара пользователя (может быть не указан)
  ownedRooms: any[]; // Массив проектов, созданных пользователем
  roomInvites: any[]; // Массив приглашений в проекты других пользователей
}

// Создаем контекст с начальным пустым значением
const UserContext = createContext<UserContextType | null>(null);

/**
 * Провайдер данных пользователя
 * Предоставляет доступ к данным пользователя всем дочерним компонентам
 *
 * @param {Object} props - Свойства компонента
 * @param {UserContextType} props.user - Данные пользователя для сохранения в контексте
 * @param {ReactNode} props.children - Дочерние компоненты, которые получат доступ к данным
 */
export function UserProvider({
  user,
  children,
}: {
  user: UserContextType;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/**
 * Хук для получения данных пользователя в компонентах
 * @returns {UserContextType} Данные текущего пользователя из контекста
 * @throws {Error} Ошибка, если хук используется вне провайдера UserProvider
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error("useUser должен использоваться внутри UserProvider");
  }

  return context;
}
