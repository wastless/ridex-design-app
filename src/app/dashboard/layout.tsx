"use server";

/**
 * Макет для всех страниц панели управления
 * Предоставляет общую структуру для всех страниц в разделе dashboard
 * Извлекает данные пользователя и передает их дочерним компонентам через контекст
 */

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { type ReactNode } from "react";
import { UserProvider } from "~/hooks/use-user";

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
  
  console.log("Dashboard layout - Session exists:", !!session);
  console.log("Dashboard layout - User ID exists:", !!session?.user?.id);
  
  // Проверяем наличие необходимых переменных окружения
  console.log("AUTH_SECRET exists:", !!process.env.AUTH_SECRET);
  console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
  console.log("NEXTAUTH_URL exists:", !!process.env.NEXTAUTH_URL);

  // Проверяем, авторизован ли пользователь
  if (!session?.user?.id) {
    // Вместо выбрасывания ошибки, возвращаем null
    // Middleware уже перенаправит пользователя на страницу входа
    console.log("User not authorized, redirecting");
    return null;
  }

  try {
    // Извлекаем полную информацию о пользователе из базы данных
    // включая его проекты и приглашения - эти данные нужны всем страницам
    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session?.user.id,
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
    return <div>Ошибка загрузки данных пользователя</div>;
  }
}
