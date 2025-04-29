/**
 * Компонент создания комнаты в Liveblocks
 * Предоставляет контекст совместной работы для дочерних компонентов
 * Инициализирует начальное состояние и присутствие пользователя в комнате
 */
"use client";

import { LiveList, LiveMap } from "@liveblocks/client";
import type { LiveObject } from "@liveblocks/client";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useStatus,
} from "@liveblocks/react";
import type { ReactNode } from "react";
import type { Layer } from "~/types";
import { PageSkeleton } from "~/components/ui/skeleton";

function RoomContent({ children }: { children: ReactNode }) {
  const status = useStatus();

  // Показываем скелетон, пока не установлено соединение
  if (status !== "connected") {
    return <PageSkeleton />;
  }

  return <>{children}</>;
}

/**
 * Компонент для создания и подключения к комнате Liveblocks
 *
 * @param {Object} props - Параметры компонента
 * @param {ReactNode} props.children - Дочерние компоненты, которые будут иметь доступ к комнате
 * @param {string} props.roomId - Идентификатор комнаты для подключения
 */
export function Room({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        // Начальное состояние присутствия пользователя в комнате
        initialPresence={{
          selection: [], // Выделенные объекты
          cursor: null, // Положение курсора
          penColor: null, // Цвет пера
          pencilDraft: null, // Черновик карандаша
        }}
        // Начальное состояние хранилища данных комнаты
        initialStorage={{
          roomColor: { r: 239, g: 239, b: 239 }, // Цвет фона комнаты
          layers: new LiveMap<string, LiveObject<Layer>>(), // Карта слоев
          layerIds: new LiveList([]), // Упорядоченный список идентификаторов слоев
          clipboard: [], // Буфер обмена
        }}
      >
        {/* Компонент для отображения состояния загрузки */}
        <ClientSideSuspense fallback={<PageSkeleton />}>
          <RoomContent>{children}</RoomContent>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
