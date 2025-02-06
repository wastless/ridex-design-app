/*** Страница редактора ***/

import { auth } from "~/server/auth";
import {Room} from "~/components/liveblocks/Room";

// Тип параметров, которые ожидаются от страницы
type ParamsType = Promise<{ id: string }>;

export default async function Page({ params }: { params: ParamsType }) {
  // Получение ID из параметров
  const { id } = await params;

  // Получаем сессию пользователя
  const session = await auth();

  return (
    <Room roomId={"room:" + id}>
      {/*<Canvas roomName={room.title} roomId={id} othersWithAccessToRoom={room.roomInvites.map((x) => x.user)} />*/}
        <h1>Hey</h1>
    </Room>
  );
}