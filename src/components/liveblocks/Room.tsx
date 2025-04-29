/**
 * Компонент создания комнаты в Liveblocks
 * Предоставляет контекст совместной работы для дочерних компонентов
 * Инициализирует начальное состояние и присутствие пользователя в комнате
 */
"use client";

import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react";
import { ReactNode } from "react";
import { Layer } from "~/types";

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
        <ClientSideSuspense
          fallback={
            <div className="flex h-screen flex-col items-center justify-center gap-0 bg-[#efefef]">
              <img
                src="/icon/ridex-logo.svg"
                alt="Ridex"
                className="h-[50px] w-[50px] animate-bounce"
              />
              <h1 className="text-paragraph-sm text-text-sub-600">
                Загрузка...
              </h1>
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
