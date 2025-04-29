"use server";

/**
 * Модуль содержит серверные функции для управления комнатами проекта
 * Включает методы создания, обновления, удаления комнат и управления доступом пользователей
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

/**
 * Функция для создания новой комнаты
 * После создания перенаправляет пользователя на страницу комнаты
 * @throws {Error} Если идентификатор пользователя не найден
 */
export async function createRoom() {
  const session = await auth(); // Получение сессии пользователя

  // Проверка наличия идентификатора пользователя
  if (!session?.user.id) {
    throw new Error("Идентификатор пользователя не найден.");
  }

  // Создание комнаты и связывание с владельцем
  const room = await db.room.create({
    data: {
      owner: {
        connect: {
          id: session.user.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  // Перенаправление на страницу созданной комнаты
  redirect("/dashboard/" + room.id);
}

/**
 * Функция для обновления названия комнаты
 * @param {string} title - Новое название комнаты
 * @param {string} id - Идентификатор комнаты
 * @throws {Error} Если идентификатор пользователя не найден или комната не найдена
 */
export async function updateRoomTitle(title: string, id: string) {
  const session = await auth();

  // Проверка наличия идентификатора пользователя
  if (!session?.user.id) {
    throw new Error("Идентификатор пользователя не найден.");
  }

  // Проверка, что комната существует и принадлежит текущему пользователю
  await db.room.findUniqueOrThrow({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  // Обновление названия комнаты
  await db.room.update({
    where: {
      id: id,
    },
    data: {
      title: title,
    },
  });

  // Обновление данных на клиенте
  revalidatePath("dashboard");
}

/**
 * Функция для удаления доступа пользователя к комнате
 * @param {string} id - Идентификатор комнаты
 * @throws {Error} Если идентификатор пользователя не найден
 */
export async function removeRoomAccess(id: string) {
  const session = await auth();

  // Проверка наличия идентификатора пользователя
  if (!session?.user.id) {
    throw new Error("Идентификатор пользователя не найден.");
  }

  // Удаляем приглашение для текущего пользователя
  await db.roomInvite.deleteMany({
    where: {
      roomId: id,
      userId: session.user.id,
    },
  });

  // Обновление данных на клиенте
  revalidatePath("dashboard");
}

/**
 * Функция для удаления комнаты
 * Если пользователь является владельцем - удаляет комнату полностью
 * Если нет - только удаляет доступ текущего пользователя
 * @param {string} id - Идентификатор комнаты
 * @throws {Error} Если идентификатор пользователя не найден
 */
export async function deleteRoom(id: string) {
  const session = await auth();

  // Проверка наличия идентификатора пользователя
  if (!session?.user.id) {
    throw new Error("Идентификатор пользователя не найден.");
  }

  // Проверяем, является ли пользователь владельцем комнаты
  const room = await db.room.findUnique({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  if (room) {
    // Если пользователь владелец - удаляем комнату полностью
    await db.room.delete({
      where: {
        id: id,
      },
    });
  } else {
    // Если пользователь не владелец - удаляем только его доступ
    await removeRoomAccess(id);
  }

  // Обновление данных на клиенте
  revalidatePath("dashboard");
}

/**
 * Функция для отправки приглашения в комнату по email
 * @param {string} id - Идентификатор комнаты
 * @param {string} inviteEmail - Email приглашаемого пользователя
 * @returns {string|undefined} - Сообщение об ошибке или undefined при успехе
 * @throws {Error} Если идентификатор пользователя не найден
 */
export async function shareRoom(id: string, inviteEmail: string) {
  const session = await auth();

  // Проверка наличия идентификатора пользователя
  if (!session?.user.id) {
    throw new Error("Идентификатор пользователя не найден.");
  }

  // Проверка, что комната существует и принадлежит текущему пользователю
  const room = await db.room.findUnique({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  if (!room) {
    return "У вас нет прав для приглашения пользователей в эту комнату.";
  }

  // Поиск пользователя по email для приглашения
  const invitedUser = await db.user.findUnique({
    where: { email: inviteEmail },
    select: { id: true },
  });

  if (!invitedUser) {
    return "Пользователь не найден.";
  }

  // Создание приглашения в комнату
  await db.roomInvite.create({
    data: {
      roomId: id,
      userId: invitedUser.id,
    },
  });

  // Обновление данных на клиенте
  revalidatePath("dashboard");
}

/**
 * Функция для удаления приглашения в комнату
 * @param {string} id - Идентификатор комнаты
 * @param {string} inviteEmail - Email пользователя, приглашение которого удаляется
 * @returns {string|undefined} - Сообщение об ошибке или undefined при успехе
 * @throws {Error} Если идентификатор пользователя не найден
 */
export async function deleteInvitation(id: string, inviteEmail: string) {
  const session = await auth();

  // Проверка наличия идентификатора пользователя
  if (!session?.user.id) {
    throw new Error("Идентификатор пользователя не найден.");
  }

  // Проверка, что комната существует и принадлежит текущему пользователю
  const room = await db.room.findUnique({
    where: {
      id: id,
      ownerId: session.user.id,
    },
  });

  if (!room) {
    return "У вас нет прав для удаления пользователей из этой комнаты.";
  }

  // Удаление приглашений, связанных с указанным email
  await db.roomInvite.deleteMany({
    where: {
      roomId: id,
      user: {
        email: inviteEmail,
      },
    },
  });

  // Обновление данных на клиенте
  revalidatePath("dashboard");
}
