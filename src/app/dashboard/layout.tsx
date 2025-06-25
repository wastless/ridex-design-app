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
  console.log("Dashboard layout - Session data:", JSON.stringify(session, null, 2));
  console.log("Dashboard layout - User ID exists:", !!session?.user?.id);
  
  // Проверяем наличие необходимых переменных окружения
  console.log("AUTH_SECRET exists:", !!process.env.AUTH_SECRET);
  console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
  console.log("NEXTAUTH_URL exists:", !!process.env.NEXTAUTH_URL);

  // ВРЕМЕННО: Используем фейковую сессию для отладки
  // Это позволит нам пройти проверку авторизации и проверить, в ней ли проблема
  const debugUser = {
    id: session?.user?.id || "debug-user-id-123", 
    email: session?.user?.email || "debug@example.com",
    name: session?.user?.name || "Debug User",
    image: session?.user?.image || null,
  };

  try {
    // Пытаемся извлечь данные пользователя из базы или создать фейковые данные для отладки
    let user;

    try {
      // Пробуем получить реального пользователя, если есть session.user.id
      if (session?.user?.id) {
        user = await db.user.findUniqueOrThrow({
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
        console.log("User data retrieved successfully from database");
      } else {
        // В режиме отладки создаём фейкового пользователя
        console.log("Using debug user data since no valid session exists");
        user = {
          ...debugUser,
          ownedRooms: [],
          roomInvites: [],
        };
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // В случае ошибки также создаём фейкового пользователя
      user = {
        ...debugUser,
        ownedRooms: [],
        roomInvites: [],
      };
    }

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
    console.error("Fatal error in dashboard layout:", error);
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
