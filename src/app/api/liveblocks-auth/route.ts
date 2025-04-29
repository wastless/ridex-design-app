/**
 * API-маршрут для аутентификации и управления сессиями Liveblocks
 * Позволяет настраивать права доступа к комнатам для совместной работы пользователей
 */

import { Liveblocks } from "@liveblocks/node";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Инициализация Liveblocks с секретным ключом из переменных окружения
const liveblocks = new Liveblocks({ secret: env.LIVEBLOCKS_SECRET_KEY });

/**
 * Обработчик POST-запросов для аутентификации в Liveblocks
 * @param {Request} req - Объект запроса
 * @returns {Response} Ответ с данными сессии Liveblocks
 */
export async function POST(req: Request) {
  // Получение текущей сессии пользователя из NextAuth
  const userSession = await auth();

  // Получение полных данных пользователя из базы данных
  // с информацией о его комнатах и приглашениях
  const user = await db.user.findUniqueOrThrow({
    where: { id: userSession?.user.id },
    include: {
      // Комнаты, созданные пользователем (владелец)
      ownedRooms: true,
      // Приглашения в комнаты, полученные пользователем
      roomInvites: {
        include: {
          room: true,
        },
      },
    },
  });

  // Подготовка сессии Liveblocks для пользователя с его профилем
  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.email ?? "Незнакомец",
      image: user.image ?? null,
    },
  });

  // Предоставляем полный доступ к комнатам, которыми владеет пользователь
  user.ownedRooms.forEach((room) => {
    session.allow(`room:${room.id}`, session.FULL_ACCESS);
  });

  // Предоставляем полный доступ к комнатам, в которые пользователь был приглашен
  user.roomInvites.forEach((invite) => {
    session.allow(`room:${invite.room.id}`, session.FULL_ACCESS);
  });

  // Авторизация сессии и получение данных для клиента
  const { status, body } = await session.authorize();

  // Возвращаем ответ с результатами авторизации
  return new Response(body, { status });
}
