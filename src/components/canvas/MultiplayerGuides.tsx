"use client";

/**
 * Компонент для отображения элементов мультиплеера на холсте.
 * Включает курсоры других пользователей и их незавершенные рисунки (черновики).
 */

import {
  shallow,
  useOthersConnectionIds,
  useOthersMapped,
} from "@liveblocks/react";
import { memo } from "react";
import Cursor from "../ui/cursor";
import Path from "./shapes/Path";
import { colorToCss } from "~/utils";
import { CanvasMode } from "~/types";

/**
 * Компонент для отображения курсоров других пользователей.
 * Получает список ID подключений и рендерит курсор для каждого активного пользователя.
 */
function Cursors() {
  const ids = useOthersConnectionIds();
  return (
    <>
      {ids.map((connectionId) => (
        <Cursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  );
}

/**
 * Компонент для отображения незавершенных рисунков других пользователей.
 * Использует данные о текущих действиях других пользователей и отображает их
 * линии карандаша в реальном времени.
 */
function Drafts() {
  const others = useOthersMapped(
    (other) => ({
      pencilDraft: other.presence.pencilDraft,
      penColor: other.presence.penColor,
    }),
    shallow,
  );

  return (
    <>
      {others.map(([key, other]) => {
        if (other.pencilDraft) {
          return (
            <Path
              key={key}
              x={0}
              y={0}
              points={other.pencilDraft}
              fill={other.penColor ? colorToCss(other.penColor) : "#CCC"}
              opacity={100}
              canvasMode={CanvasMode.None}
            />
          );
        }
        return null;
      })}
    </>
  );
}

/**
 * Основной компонент для отображения элементов мультиплеера.
 * Объединяет отображение курсоров и черновиков других пользователей.
 */
export default memo(function MultiplayerGuides() {
  return (
    <>
      <Cursors />
      <Drafts />
    </>
  );
});
