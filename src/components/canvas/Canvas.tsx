/*** Компонент для отрисовки графики ***/
"use client";

import { useMutation, useStorage } from "@liveblocks/react";
import { colorToCss, pointerEventToCanvasPoint } from "~/utils";
import { nanoid } from "nanoid";
import LayerComponent from "~/components/canvas/LayerComponent";
import {
  Camera,
  CanvasMode,
  CanvasState,
  EllipseLayer,
  Layer,
  LayerType,
  Point,
  RectangleLayer,
  TextLayer,
} from "~/types";
import { LiveObject } from "@liveblocks/client";
import { useState } from "react";
import ToolsBar from "~/components/toolsbar/ToolsBar";

// Ограничение на количество слоев
const MAX_LAYERS = 100;

export default function Canvas() {
  const roomColor = useStorage((root) => root.roomColor); // Получаем цвет комнаты из хранилища
  const layerIds = useStorage((root) => root.layerIds); // Получаем id слоев из хранилища
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 }); // Состояние камеры
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  }); // Режим холста

  // Функция добавления нового слоя
  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text,
      position: Point,
    ) => {
      const liveLayers = storage.get("layers"); // Получаем слои из хранилища

      // Проверка на максимальное количество слоев
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds"); // Создаем новый слой
      const layerId = nanoid(); // Генерируем уникальный id для слоя
      let layer: LiveObject<Layer> | null = null; // Инициализируем переменную слоя для дальнейшего добавления в хранилище

      // В зависимости от типа слоя создаем объект с начальными свойствами
      if (layerType === LayerType.Rectangle) {
        layer = new LiveObject<RectangleLayer>({
          type: LayerType.Rectangle,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      } else if (layerType === LayerType.Ellipse) {
        layer = new LiveObject<EllipseLayer>({
          type: LayerType.Ellipse,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      } else if (layerType === LayerType.Text) {
        layer = new LiveObject<TextLayer>({
          type: LayerType.Text,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fontSize: 16,
          text: "Text",
          fontWeight: 400,
          fontFamily: "Inter",
          stroke: { r: 217, g: 217, b: 217 },
          fill: { r: 217, g: 217, b: 217 },
          opacity: 100,
        });
      }

      // Если слой создан, добавляем его в хранилище
      if (layer) {
        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);

        setMyPresence({ selection: [layerId] }, { addToHistory: true }); // Обновляем изменения в хранилище
        setState({ mode: CanvasMode.None }); // Сбрасываем режим холста
      }
    },
    [],
  );

  // Обработчик нажатия (отпускает указатель)
  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent) => {
      if (canvasState.mode === CanvasMode.RightClick) return; // Проверка режима, чтобы избежать лишних действий
      const point = pointerEventToCanvasPoint(e, camera); // Получаем координаты точки на холсте

      // В зависимости от режима холста выполняем действия
      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        /*unselectLayers();*/
        setState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } /* else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: null });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      }*/ else {
        setState({ mode: CanvasMode.None });
      }

      // ? history.resume(); // Фиксируем завершение действия в истории
    },
    /*[canvasState, setState, insertLayer, unselectLayers, history],*/
      [canvasState, setState, insertLayer],
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
          {/*? <SelectionTools />*/}
          {/* SVG-элемент для рендеринга графики */}
          <svg
            /*onWheel={onWheel}*/
            onPointerUp={onPointerUp}
            /* onPointerDown={onPointerDown}
                                      onPointerMove={onPointerMove}
                                      onPointerLeave={onPointerLeave}*/
            className="h-full w-full"
            /*onContextMenu={(e) => e.preventDefault()}*/
          >
            {/* Группа для рендеринга слоев */}
            {/*<g style={{transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`}}}>*/}
            <g>
              {/*{layerIds?.map((layerId) => (
                <LayerComponent
                  key={layerId}
                  id={layerId}
                  onLayerPointerDown={onLayerPointerDown}
                />
              ))}*/}

              {/*? <SelectionBox />*/}
              {/*{canvasState.mode === CanvasMode.SelectionNet &&
                canvasState.current != null && (
                  <rect
                    className="fill-blue-600/5 stroke-blue-600 stroke-[0.5]"
                    x={Math.min(canvasState.origin.x, canvasState.current.x)}
                    y={Math.min(canvasState.origin.y, canvasState.current.y)}
                    width={Math.abs(
                      canvasState.origin.x - canvasState.current.x,
                    )}
                    height={Math.abs(
                      canvasState.origin.y - canvasState.current.y,
                    )}
                  />
                )}
              <MultiplayerGuides />
              {pencilDraft !== null && pencilDraft.length > 0 && (
                <Path
                  x={0}
                  y={0}
                  opacity={100}
                  fill={colorToCss({ r: 217, g: 217, b: 217 })}
                  points={pencilDraft}
                />
                )}*/}
            </g>
          </svg>
        </div>
      </main>

      <ToolsBar
        canvasState={canvasState}
        setCanvasState={(newState) => setState(newState)}
      />
      {/*? <Sidebars />*/}
    </div>
  );
}
