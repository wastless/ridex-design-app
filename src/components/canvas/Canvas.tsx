"use client";

import { useStorage } from "@liveblocks/react";
import { colorToCss, pointerEventToCanvasPoint } from "~/utils";
import ToolsBar from "~/components/canvas/ToolsBar";
import React, { useCallback, useState } from "react";
import { Camera, CanvasMode, CanvasState, Point } from "~/types";

export default function Canvas() {
  const roomColor = useStorage((root) => root.roomColor); // Получаем цвет комнаты из хранилища
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 }); // Состояние камеры
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  }); // Режим холста
  const [points, setPoints] = useState<Point[]>([]); // Состояние для хранения точек

  // Обработчик прокрутки колесика мыши
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX, // Сдвигаем камеру по x
      y: camera.y - e.deltaY, // Сдвигаем камеру по y
      zoom: camera.zoom, // Оставляем зум без изменений
    }));
  }, []);

  // Обработчик выхода курсора за пределы холста
  const onPointerLeave = useCallback(() => {
    console.log("Cursor left the canvas");
  }, []);

  // Обработчик нажатия (отпускает указатель)
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera); // Получаем координаты точки на холсте
      setPoints((prevPoints) => [...prevPoints, point]); // Добавляем точку в состояние
      console.log("Pointer Up at:", point);
    },
    [camera],
  );

  return (
    <div className="flex h-screen w-full">
      <main className="fixed left-0 right-0 h-screen overflow-y-auto">
        {/* Контейнер с цветом фона, основанным на roomColor или дефолтном значении */}
        <div
          style={{
            backgroundColor: roomColor ? colorToCss(roomColor) : "#efefef",
          }}
          className="h-full w-full touch-none"
        >
          {/* SVG-элемент для рендеринга графики */}
          <svg
            onWheel={onWheel}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
            className="h-full w-full"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Группа для рендеринга слоев */}
            <g
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
              }}
            >
              {/* Отображение точек */}
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill="red"
                />
              ))}
            </g>
          </svg>
        </div>
      </main>

      {/* Панель инструментов */}
      <ToolsBar
        canvasState={canvasState}
        setCanvasState={(newState) => setState(newState)}
        zoomIn={() => {
          setCamera((camera) => ({ ...camera, zoom: camera.zoom + 0.1 }));
        }}
        zoomOut={() => {
          setCamera((camera) => ({ ...camera, zoom: camera.zoom - 0.1 }));
        }}
        canZoomIn={camera.zoom < 2}
        canZoomOut={camera.zoom > 0.5}
      />
    </div>
  );
}