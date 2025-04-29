// Определение Liveblocks типов для приложения
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data

import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { Color, Layer, Point } from "~/types";

declare global {
  interface Liveblocks {
    // Отображение присутствия пользователей
    Presence: {
      selection: string[];
      cursor: Point | null;
      penColor: Color | null;
      pencilDraft: [x: number, y: number, pressure: number][] | null;
    };

    // Хранилище данных
    Storage: {
      roomColor: Color | null;
      layers: LiveMap<string, LiveObject<Layer>>;
      layerIds: LiveList<string>;
      clipboard: Layer[];
    };

    // Информация о пользователе
    UserMeta: {
      id: string;
      info: {
        name: string;
        image?: string | null;
      };
    };

    // События пользователей
    RoomEvent: {};
      // Например, событие реакции
      // | { type: "PLAY" } 
      // | { type: "REACTION"; emoji: "🔥" };

    // Позовательские метаданные, устанавливаемые в потоках
    ThreadMetadata: {
      // Например, привязка координат к потоку
      // x: number;
      // y: number;
    };

    // Пользовательская информация о комнате
    RoomInfo: {
      // Например, комнаты с названием и URL-адресом
      // title: string;
      // url: string;
    };
  }
}

export {};
