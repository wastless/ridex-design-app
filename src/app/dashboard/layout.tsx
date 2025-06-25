"use server";

/**
 * Макет для всех страниц панели управления
 * Предоставляет общую структуру для всех страниц в разделе dashboard
 * Извлекает данные пользователя и передает их дочерним компонентам через контекст
 * 
 * ВНИМАНИЕ: Проверка авторизации временно отключена для отладки
 */

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { type ReactNode } from "react";
import { UserProvider } from "~/hooks/use-user";
import { redirect } from "next/navigation";

/**
 * Макет-обертка для страниц панели управления
 * Загружает данные пользователя один раз и передает их всем дочерним страницам через контекст
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы (содержимое страницы)
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Получаем сессию пользователя для проверки авторизации
  const session = await auth();
  
  // Проверяем, авторизован ли пользователь
  if (!session?.user?.id) {
    // Перенаправляем на страницу входа, если пользователь не авторизован
    console.log("User not authorized, redirecting to signin");
    redirect('/signin');
    return null; // Код не выполнится после redirect, но нужен для типизации
  }

  try {
    // Извлекаем полную информацию о пользователе из базы данных
    // включая его проекты и приглашения - эти данные нужны всем страницам
    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      include: {
        // Проекты, созданные пользователем
        ownedRooms: true,
        // Приглашения пользователя в проекты других пользователей
        roomInvites: {
          include: {
            room: true,
          },
        },
      },
    });
    
    console.log("User data retrieved successfully");

    return (
      <div className="flex h-screen w-full">
        {/* Оборачиваем дочерние компоненты в провайдер контекста пользователя */}
        <UserProvider
          user={{
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            ownedRooms: user.ownedRooms,
            roomInvites: user.roomInvites,
          }}
        >
          {children}
        </UserProvider>
      </div>
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-600">Ошибка загрузки данных</h1>
          <p className="mt-2 text-gray-700">Произошла ошибка при загрузке данных пользователя.</p>
          <p className="mt-4 text-gray-500">Попробуйте <a href="/signin" className="text-blue-600 underline">войти заново</a>.</p>
        </div>
      </div>
    );
  }
}
