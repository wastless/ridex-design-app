"use client";

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

  // Get the selected layer if there is one
  const selectedLayer = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  // Get the layer object from storage if a layer is selected
  const layer = useStorage((root) => {
    if (!selectedLayer) {
      return null;
    }
    return root.layers.get(selectedLayer) ?? null;
  }) as Layer | null;

  return (
    <>
      {/* Top panel */}
      {!leftIsMinimized && (
        <TopPanel
          roomName={roomName}
          roomId={roomId}
          othersWithAccessToRoom={othersWithAccessToRoom}
          owner={owner}
        />
      )}

      {/* Left sidebar */}
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

      {/* Right sidebar */}
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
