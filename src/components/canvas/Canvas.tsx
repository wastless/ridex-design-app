/*** Компонент для отрисовки графики ***/
"use client";

import { useStorage } from "@liveblocks/react";
import { colorToCss } from "~/utils";

export default function Canvas() {
  const roomColor = useStorage((root) => root.roomColor);

  return (
      <div className="flex h-screen w-full">
        <main className="fixed left-0 right-0 h-screen overflow-y-auto">
          <div style={{ backgroundColor: roomColor ? colorToCss(roomColor) : "#efefef"}} className="h-full w-full touch-none">
            <svg className="h-full w-full">
              <g> </g>
            </svg>
          </div>
        </main>
      </div>
  );
}
