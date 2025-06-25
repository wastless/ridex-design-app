"use client";

/**
 * Компонент для отображения интерфейса редактора холста. Отвечает за управление 
 * отображением левой и правой боковых панелей, обработку состояния свёрнутых/развёрнутых 
 * панелей, передачу данных о выбранных слоях между компонентами, а также синхронизацию 
 * интерфейса с состоянием Liveblocks.
 */

import React from "react";
import { useSelf, useStorage } from "@liveblocks/react";
import type { UserInfo } from "../../types/user";
import type { Layer } from "~/types";
import { RightSidebar, MinimizedRightSidebar } from "./RightSidebar";
import { LeftSidebar, MinimizedLeftSidebar } from "./LeftSidebar";
import TopPanel from "./TopPanel";

export default function Sidebar({
  leftIsMinimized,
  setLeftIsMinimized,
  roomName,
  roomId,
  othersWithAccessToRoom,
  owner,
}: {
  leftIsMinimized: boolean;
  setLeftIsMinimized: (value: boolean) => void;
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: UserInfo[];
  owner: UserInfo;
}) {
  const me = useSelf();
  const isOwner = me?.info.name === owner.email;

  // Получаем выбранный слой, если он есть
  const selectedLayer = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  // Получаем объект слоя из хранилища, если выбран слой
  const layer = useStorage((root) => {
    if (!selectedLayer) {
      return null;
    }
    return root.layers.get(selectedLayer) ?? null;
  }) as Layer | null;

  return (
    <>
      {/* Верхний панель */}
      {!leftIsMinimized && (
        <TopPanel
          roomName={roomName}
          roomId={roomId}
          othersWithAccessToRoom={othersWithAccessToRoom}
          owner={owner}
        />
      )}

      {/* Левая панель */}
      {!leftIsMinimized ? (
        <LeftSidebar 
          setLeftIsMinimized={setLeftIsMinimized} 
        />
      ) : (
        <MinimizedLeftSidebar
          setLeftIsMinimized={setLeftIsMinimized}
          roomName={roomName}
        />
      )}

      {/* Правая панель */}
      {!leftIsMinimized || layer ? (
        <RightSidebar
          leftIsMinimized={leftIsMinimized}
          layer={layer}
          _roomId={roomId}
          _othersWithAccessToRoom={othersWithAccessToRoom}
          _owner={owner}
          _isOwner={isOwner}
        />
      ) : (
        <MinimizedRightSidebar
          roomId={roomId}
          othersWithAccessToRoom={othersWithAccessToRoom}
          owner={owner}
          isOwner={isOwner}
        />
      )}
    </>
  );
}
