"use client";

/**
 * Контекст для состояния холста и общего доступа к функциям холста
 * Предоставляет глобальное состояние и функции для всех компонентов холста
 */

import React, { createContext, useContext, useState } from "react";
import { type Camera, CanvasMode, type CanvasState } from "~/types";
import { useHistory, useSelf, useStorage } from "@liveblocks/react";

// Интерфейс типов данных, предоставляемых контекстом холста
interface CanvasContextType {
  canvasState: CanvasState; // Текущее состояние холста
  setState: React.Dispatch<React.SetStateAction<CanvasState>>; // Функция изменения состояния
  camera: Camera; // Позиция и масштаб камеры
  setCamera: React.Dispatch<React.SetStateAction<Camera>>; // Функция изменения камеры
  leftIsMinimized: boolean; // Состояние левой панели (свернута/развернута)
  setLeftIsMinimized: React.Dispatch<React.SetStateAction<boolean>>;
  roomColor: {
    readonly r: number;
    readonly g: number;
    readonly b: number;
  } | null; // Цвет комнаты
  layerIds: readonly string[] | null; // Массив ID слоев
  pencilDraft: [x: number, y: number, pressure: number][] | null; // Текущий рисуемый путь
  history: ReturnType<typeof useHistory>; // История изменений
  MAX_LAYERS: number; // Максимальное количество слоев
}

// Создание контекста
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// Провайдер контекста холста
export function CanvasProvider({ children }: { children: React.ReactNode }) {
  // Состояние холста
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  // Состояние камеры (позиция и масштаб)
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  // Состояние левой панели
  const [leftIsMinimized, setLeftIsMinimized] = useState(false);

  // Получение данных из хранилища Liveblocks
  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const history = useHistory();
  const MAX_LAYERS = 100; // Ограничение на количество слоев

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

// Хук для использования контекста холста в компонентах
export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas должен использоваться внутри CanvasProvider");
  }
  return context;
}
