"use server";

/**
 * Страница редактора проекта
 * Отображает холст для редактирования проекта с инструментами дизайна
 */

import Canvas from "~/components/canvas/Canvas";
import { Room } from "~/components/liveblocks/Room";
import { auth } from "~/server/auth";
import { CanvasProvider } from "~/components/canvas/helper/CanvasContext";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

// Тип параметров, которые ожидаются от страницы
type ParamsType = Promise<{ id: string }>;

/**
 * Компонент страницы редактора конкретного проекта
 * Предоставляет canvas для работы с дизайном в режиме реального времени
 *
 * @param {Object} props - Свойства компонента
 * @param {ParamsType} props.params - Параметры из URL, включающие ID проекта
 */
export default async function EditorPage({ params }: { params: ParamsType }) {
  // Извлекаем ID проекта из параметров
  const { id } = await params;

  // Получаем сессию текущего пользователя
  const session = await auth();

  // Извлекаем информацию о проекте из базы данных
  const room = await db.room.findUnique({
    where: { id: id },
    select: {
      title: true,
      ownerId: true,
      owner: true,
      roomInvites: {
        select: {
          user: true,
        },
      },
    },
  });

  // Если проект не найден, перенаправляем на страницу 404
  if (!room) {
    redirect("/404");
  }

  // Получаем список ID пользователей, приглашенных в проект
  const inviteeUserIds = room.roomInvites.map((invite) => invite.user.id);

  // Проверяем, что пользователь имеет право доступа к проекту
  // (либо владелец, либо приглашен)
  const userHasAccess =
    inviteeUserIds.includes(session?.user.id ?? "") ||
    session?.user.id === room.ownerId;

  if (!userHasAccess) {
    redirect("/404");
  }

  return (
    // Оборачиваем в компонент Room для синхронизации через Liveblocks
    <Room roomId={`room:${id}`}>
      {/* Провайдер контекста для холста */}
      <CanvasProvider>
        {/* Сам компонент холста */}
        <Canvas
          roomName={room.title}
          roomId={id}
          othersWithAccessToRoom={room.roomInvites.map((invite) => invite.user)}
          owner={room.owner}
        />
      </CanvasProvider>
    </Room>
  );
}
