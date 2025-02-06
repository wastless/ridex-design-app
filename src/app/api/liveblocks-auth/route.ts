/*** Компонент для работы сессий Liveblocks ***/

import { Liveblocks } from "@liveblocks/node";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Инициализация Liveblocks с секретным ключом
const liveblocks = new Liveblocks({ secret: env.LIVEBLOCKS_SECRET_KEY });

export async function POST(req: Request) {
  // Получение текущей сессии пользователя
  const userSession = await auth();

  // Получение пользователя из базы данных с его комнатами и приглашениями
  const user = await db.user.findUniqueOrThrow({
    where: { id: userSession?.user.id },
    include: {
      ownedRooms: true,
      roomInvites: {
        include: {
          room: true,
        },
      },
    },
  });

  // Подготовка сессии Liveblocks для пользователя
  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.email ?? "Незнакомец",
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

  // Предоставляем полный доступ к тестовой комнате
  session.allow(`room:${"test"}`, session.FULL_ACCESS);

  // Авторизация сессии в Liveblocks
  const { status, body } = await session.authorize();

  // Возвращаем ответ с результатами авторизации
  return new Response(body, { status });
}
