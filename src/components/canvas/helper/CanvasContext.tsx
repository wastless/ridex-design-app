"use client";

import React, { createContext, useContext, useState } from "react";
import { type Camera, CanvasMode, type CanvasState } from "~/types";
import { useHistory, useSelf, useStorage } from "@liveblocks/react";

interface CanvasContextType {
  canvasState: CanvasState;
  setState: React.Dispatch<React.SetStateAction<CanvasState>>;
  camera: Camera;
  setCamera: React.Dispatch<React.SetStateAction<Camera>>;
  leftIsMinimized: boolean;
  setLeftIsMinimized: React.Dispatch<React.SetStateAction<boolean>>;
  roomColor: {
    readonly r: number;
    readonly g: number;
    readonly b: number;
  } | null;
  layerIds: readonly string[] | null;
  pencilDraft: [x: number, y: number, pressure: number][] | null;
  history: ReturnType<typeof useHistory>;
  MAX_LAYERS: number;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [leftIsMinimized, setLeftIsMinimized] = useState(false);

  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const history = useHistory();
  const MAX_LAYERS = 100;

  return (
    <CanvasContext.Provider
      value={{
        canvasState,
        setState,
        camera,
        setCamera,
        leftIsMinimized,
        setLeftIsMinimized,
        roomColor,
        layerIds,
        pencilDraft,
        history,
        MAX_LAYERS,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}
