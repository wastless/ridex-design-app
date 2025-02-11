/*** Компонент для отрисовки графики ***/
"use client";

import {useHistory, useMutation, useSelf, useStorage} from "@liveblocks/react";
import {
  colorToCss,
  penPointsToPathPayer,
  pointerEventToCanvasPoint,
} from "~/utils";
import { nanoid } from "nanoid";
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
import { useCallback, useState } from "react";
import ToolsBar from "~/components/toolsbar/ToolsBar";
import LayerComponent from "~/components/canvas/LayerComponent";
import Path from "~/components/canvas/Path";
import SelectionBox from "~/components/canvas/SelectionBox";

// Ограничение на количество слоев
const MAX_LAYERS = 100;

export default function Canvas() {
  const roomColor = useStorage((root) => root.roomColor); // Получаем цвет комнаты из хранилища
  const layerIds = useStorage((root) => root.layerIds); // Получаем id слоев из хранилища
  const pencilDraft = useSelf((me) => me.presence.pencilDraft); // Получаем незавершенный рисунок из хранилища
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 }); // Состояние камеры
  const [canvasState, setState] = useState<CanvasState>({mode: CanvasMode.None}); // Режим холста
    const history = useHistory(); // История действий

  // Функция добавления нового слоя
  const insertLayer = useMutation(({ storage, setMyPresence }, layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text, position: Point,) => {
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
          stroke: { r: 0, g: 0, b: 0 },
          fill: { r: 0, g: 0, b: 0 },
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
    }, []);

  // Функция начала рисования
  const startDrawing = useMutation(({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]], // Сохраняем первую точку в черновике
        penColor: { r: 0, g: 0, b: 0 },
      });
    }, []);

  // Функция продолжения рисования
  const continueDrawing = useMutation(({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence; // Получаем текущий черновик

      // Проверка условий для продолжения рисования
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft === null
      ) {
        return;
      }

      // Добавляем новую точку в черновик
      setMyPresence({
        cursor: point,
        pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    }, [canvasState.mode]);

  // Функция завершения рисования и вставки пути
  const insertPath = useMutation(({ storage, self, setMyPresence }) => {
    const liveLayers = storage.get("layers"); // Получаем слои из хранилища
    const { pencilDraft } = self.presence; // Получаем черновик из хранилища

    // Проверка условий для вставки пути
    if (
      pencilDraft === null ||
      pencilDraft.length < 2 ||
      liveLayers.size >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null }); // Сбрасываем черновик
      return;
    }

    const id = nanoid(); // Генерируем уникальный id для нового слоя

    // Функция преобразования точек в путь
    liveLayers.set(
      id,
      new LiveObject(penPointsToPathPayer(pencilDraft, { r: 0, g: 0, b: 0 })),
    );

    const liveLayerIds = storage.get("layerIds"); // Получаем id слоев из хранилища
    liveLayerIds.push(id); // Добавляем id нового слоя в хранилище
    setMyPresence({ pencilDraft: null }); // Сбрасываем черновик
    setState({ mode: CanvasMode.Pencil }); // Сбрасываем режим холста
  }, []);

  // Обработчик нажатия (отпускает указатель)
  const onPointerUp = useMutation(({}, e: React.PointerEvent) => {
      if (canvasState.mode === CanvasMode.RightClick) return; // Проверка режима, чтобы избежать лишних действий
      const point = pointerEventToCanvasPoint(e, camera); // Получаем координаты точки на холсте

      // В зависимости от режима холста выполняем действия
      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        /*unselectLayers();*/
        /*setState({ mode: CanvasMode.None });*/
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: null });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } /*else {
        setState({ mode: CanvasMode.None });
      }*/

      history.resume(); // Фиксируем завершение действия в истории
    },
    /*[canvasState, setState, insertLayer, unselectLayers, history],*/
    [canvasState, setState, insertLayer, history],
  );

  // Обработчик нажатия (нажимает указатель)
  const onPointerDown = useMutation(({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera); // Получаем координаты точки на холсте

      // В режиме перемещения сохраняется начальная точка, от которой будет происходить движение
      if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: point });
        return;
      }

      // Режим вставки объекта игнорируем
      if (canvasState.mode === CanvasMode.Inserting) return;

      // В режиме рисования вызываем функцию начала рисования
      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setState({ origin: point, mode: CanvasMode.Pressing });
    }, [camera, canvasState.mode, setState, startDrawing]);

  // Обработчик нажатия (двигает указатель)
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera); // Получаем координаты точки на холсте

      /*if (canvasState.mode === CanvasMode.Pressing) {
                        startMultiSelection(point, canvasState.origin);
                      } else if (canvasState.mode === CanvasMode.SelectionNet) {
                        updateSelectionNet(point, canvasState.origin);
                      } else */
      if (
        canvasState.mode === CanvasMode.Dragging &&
        canvasState.origin !== null
      ) {
        const deltaX = e.movementX;
        const deltaY = e.movementY;

        setCamera((camera) => ({
          x: camera.x + deltaX,
          y: camera.y + deltaY,
          zoom: camera.zoom,
        }));
        /*} else if (canvasState.mode === CanvasMode.Translating) {
                      translateSelectedLayers(point);*/
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(point, e);
      } /* else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(point);
      }*/
      setMyPresence({ cursor: point });
    },
    [
      camera,
      canvasState,
      /*translateSelectedLayers,
                      continueDrawing,
                      resizeSelectedLayer,
                      updateSelectionNet,
                      startMultiSelection,*/
    ],
  );

  // Обработчик прокрутки колесика мыши
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX, // Сдвигаем камеру по x
      y: camera.y - e.deltaY, // Сдвигаем камеру по y
      zoom: camera.zoom, // Оставляем зум без изменений
    }));
  }, []);

  // Обработчик нажатия на слой
  const onLayerPointerDown = useMutation( ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {

      // Игнорирование действий в режиме рисования или вставки объекта
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      history.pause(); // Приостанавливаем историю

      // Останавливаем вспытие клика
      e.stopPropagation();
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence(
          {
            selection: [layerId],
          },
          { addToHistory: true },
        );
      }

      // Проверяем выделение
      if (e.nativeEvent.button === 2) {
        setState({ mode: CanvasMode.RightClick });
      } else {
        const point = pointerEventToCanvasPoint(e, camera);
        setState({ mode: CanvasMode.Translating, current: point });
      }
    }, [camera, canvasState.mode, history]);

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
            onWheel={onWheel}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            /*  onPointerLeave={onPointerLeave}*/
            className="h-full w-full"
            /*onContextMenu={(e) => e.preventDefault()}*/
          >
            {/* Группа для рендеринга слоев */}
            <g
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
              }}
            >
              {layerIds?.map((layerId) => (
                <LayerComponent
                  key={layerId}
                  id={layerId}
                  onLayerPointerDown={onLayerPointerDown}
                />
              ))}

              <SelectionBox />
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
              <MultiplayerGuides />*/}
              {pencilDraft !== null && pencilDraft.length > 0 && (
                <Path
                  x={0}
                  y={0}
                  opacity={100}
                  fill={colorToCss({ r: 0, g: 0, b: 0 })}
                  points={pencilDraft}
                />
              )}
            </g>
          </svg>
        </div>
      </main>

      <ToolsBar canvasState={canvasState} setCanvasState={(newState) => setState(newState)}
        zoomIn={() => {
          setCamera((camera) => ({ ...camera, zoom: camera.zoom + 0.1 }));
        }}
        zoomOut={() => {
          setCamera((camera) => ({ ...camera, zoom: camera.zoom - 0.1 }));
        }}
        canZoomIn={camera.zoom < 2}
        canZoomOut={camera.zoom > 0.5}
      />
      {/*? <Sidebars />*/}
    </div>
  );
}
