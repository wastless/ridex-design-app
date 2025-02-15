/*** Компонент для отрисовки графики Canvas ***/
"use client";

import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useSelf,
  useStorage,
} from "@liveblocks/react";
import {
  colorToCss,
  findIntersectionLayersWithRectangle,
  penPointsToPathPayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "~/utils";
import LayerComponent from "./LayerComponent";
import {
  Camera,
  CanvasMode,
  CanvasState,
  EllipseLayer,
  Layer,
  LayerType,
  Point,
  RectangleLayer,
  Side,
  TextLayer,
  XYWH,
} from "~/types";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import React, { useCallback, useState } from "react";
import Path from "./Path";
import SelectionBox from "./SelectionBox";
import SelectionTools from "~/components/canvas/SelectionTools";
import ToolsBar from "~/components/canvas/ToolsBar";
import useHotkeys from "~/hooks/useHotkeys";
import { zoomIn, zoomOut } from "~/utils/zoom";
/*import SelectionTools from "./SelectionTools";
import Sidebars from "../sidebars/Sidebars";
import MultiplayerGuides from "./MultiplayerGuides";*/

// Ограничение на количество слоев
const MAX_LAYERS = 100;

export default function Canvas() {
  const [leftIsMinimized, setLeftIsMinimized] = useState(false); // Режим минималистичного UI
  const roomColor = useStorage((root) => root.roomColor); // Получаем цвет комнаты из хранилища
  const layerIds = useStorage((root) => root.layerIds); // Получаем id слоев из хранилища
  const pencilDraft = useSelf((me) => me.presence.pencilDraft); // Получаем незавершенный рисунок из хранилища
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 }); // Состояние камеры
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  }); // Режим холста
  const history = useHistory(); // История действий
  const canUndo = useCanUndo(); // Проверка возможности отмены действия
  const canRedo = useCanRedo(); // Проверка возможности повторения действия

  useHotkeys(setState, setCamera, leftIsMinimized, setLeftIsMinimized); // Подключаем хук для горячих клавиш

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
          stroke: null,
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
    },
    [],
  );

  // Функция начала рисования
  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]], // Сохраняем первую точку в черновике
        penColor: { r: 0, g: 0, b: 0 },
      });
    },
    [],
  );

  // Функция продолжения рисования
  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
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
    },
    [canvasState.mode],
  );

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

  // Обработчик нажатий на маркеры изменения размера
  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setState({
        mode: CanvasMode.Resizing,
        initialBounds, // Запоминает начальные границы элементы
        corner, // Запоминает угол, с которого началось изменение размера
      });
    },
    [history],
  );

  // Функция изменения размера слоя
  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      // Проверка на режим изменения размера
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      // Вычисление новых границ слоя
      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );

      const liveLayers = storage.get("layers"); // Получаем слои из хранилища

      // Обновляем границы выделенных слоев, если они есть в хранилище и есть выделенные слои
      if (self.presence.selection.length > 0) {
        const layer = liveLayers.get(self.presence.selection[0]!);
        if (layer) {
          layer.update(bounds); // Обновляем границы слоя
        }
      }
    },
    [canvasState],
  );

  // Функция перемещения выделенных слоев
    const translateSelectedLayers = useMutation(
        ({ storage, self }, point: Point) => {
            if (canvasState.mode !== CanvasMode.Translating) {
                return;
            }

            const offset = {
                x: point.x - canvasState.current.x,
                y: point.y - canvasState.current.y,
            };

            const liveLayers = storage.get("layers");
            for (const id of self.presence.selection) {
                const layer = liveLayers.get(id);
                if (layer) {
                    layer.update({
                        x: layer.get("x") + offset.x,
                        y: layer.get("y") + offset.y,
                    });
                }
            }

            setState({ mode: CanvasMode.Translating, current: point });
        },
        [canvasState],
    );

  // Функция сброса выделения слоев
  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  // Функция инициализации множественного выделения
  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    // Проверяем, что разница между начальной и текущей точкой больше 5
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setState({ mode: CanvasMode.SelectionNet, origin, current });
    }
  }, []);

  // Обработчик прокрутки колесика мыши
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX, // Сдвигаем камеру по x
      y: camera.y - e.deltaY, // Сдвигаем камеру по y
      zoom: camera.zoom, // Оставляем зум без изменений
    }));
  }, []);

  // Обработчик выхода курсора за пределы холста
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

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
        unselectLayers();
        setState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: null });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else {
        setState({ mode: CanvasMode.None });
      }

      history.resume(); // Фиксируем завершение действия в истории
    },
    [canvasState, setState, insertLayer, unselectLayers, history],
  );

  // Обработчик нажатия (нажимает указатель)
  const onPointerDown = useMutation(
    ({}, e: React.PointerEvent) => {
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
    },
    [camera, canvasState.mode, setState, startDrawing],
  );

  // Функция вычисления слоев внутри прямоугольной области
  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      if (layerIds) {
        const layers = storage.get("layers").toImmutable(); // Получаем слои из хранилища
        // Обновляем состояние, сохраняя границы выделения
        setState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        });
        // Вычисляем слои, которые внутри прямоугольной области
        const ids = findIntersectionLayersWithRectangle(
          layerIds,
          layers,
          origin,
          current,
        );
        setMyPresence({ selection: ids }); // Обновляем выделение
      }
    },
    [layerIds],
  );

  // Обработчик нажатия (двигает указатель)
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera); // Получаем координаты точки на холсте

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(point, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(point, canvasState.origin);
      } else if (
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
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(point);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(point, e);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(point);
      }
      setMyPresence({ cursor: point });
    },
    [
      camera,
      canvasState,
      continueDrawing,
      resizeSelectedLayer,
      translateSelectedLayers,
      startMultiSelection,
      updateSelectionNet,
    ],
  );

  // Обработчик нажатия на слой
  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
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
    },
    [camera, canvasState.mode, history],
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
          {/*Контектное меню по правому клику*/}
          <SelectionTools camera={camera} canvasMode={canvasState.mode} />

          {/* SVG-элемент для рендеринга графики */}
          <svg
            onWheel={onWheel}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
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
              {layerIds?.map((layerId) => (
                <LayerComponent
                  key={layerId}
                  id={layerId}
                  onLayerPointerDown={onLayerPointerDown}
                />
              ))}

              {/* Бокс с размерами для выделения слоев */}
              <SelectionBox
                onResizeHandlePointerDown={onResizeHandlePointerDown}
              />

              {/* Прямоугольник с выделением слоев */}
              {canvasState.mode === CanvasMode.SelectionNet &&
                canvasState.current != null && (
                  <rect
                    className="fill-primary-alpha-10 stroke-primary-light stroke-[0.5]"
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
              {/*Отображение пользователей*/}
              {/*<MultiplayerGuides />*/}
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

      {/* Панель инструментов */}
      <ToolsBar
        canvasState={canvasState}
        setCanvasState={(newState) => setState(newState)}
        zoomIn={() => zoomIn(setCamera)}
        zoomOut={() => zoomOut(setCamera)}
      />

      {/*Боковые панели*/}
      {/*? <Sidebars roomName={roomName}
      roomId={roomId}
      othersWithAccessToRoom={othersWithAccessToRoom}
      leftIsMinimized={leftIsMinimized}
      setLeftIsMinimized={setLeftIsMinimized} />*/}
    </div>
  );
}
