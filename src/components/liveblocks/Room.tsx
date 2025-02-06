/*** Компонент создания комнаты ***/
"use client";

import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react";
import { ReactNode } from "react";
import { Layer } from "~/types";

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
        initialPresence={{
          selection: [],
          cursor: null,
          penColor: null,
          pencilDraft: null,
        }}
        initialStorage={{
          roomColor: { r: 239, g: 239, b: 239 },
          layers: new LiveMap<string, LiveObject<Layer>>(),
          layerIds: new LiveList([]),
        }}
      >
        {/*Отображение состояние загрузки*/}
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
