/*** Компонент для отрисовки графики Canvas ***/
"use client";


import { useMutation } from "@liveblocks/react";
import {
  calculateBoundingBox,
  colorToCss,
  pointerEventToCanvasPoint,
} from "~/utils";
import { zoomIn, zoomOut } from "~/utils/zoom";
import { CanvasMode, LayerType } from "~/types";
import { useCallback, useState } from "react";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { useDrawingFunctions } from "~/components/canvas/helper/DrawingFunctions";
import { useLayerManipulation } from "~/components/canvas/helper/LayerManipulation";
import { useSelectionFunctions } from "~/components/canvas/helper/SelectionFunctions";
import { useCreateLayerFunctions } from "~/components/canvas/helper/useShapeDrawingFunctions";

import LayerComponent from "./LayerComponent";
import Path from "./shapes/Path";
import SelectionBox from "./SelectionBox";
import SelectionTools from "~/components/canvas/SelectionTools";
import ToolsBar from "~/components/canvas/ToolsBar";
import useHotkeys from "~/hooks/useHotkeys";
import RenderPreviewLayer from "~/components/canvas/helper/RenderPreviewLayer";
import Sidebars from "~/components/sidebars/Sidebars";

/*
import MultiplayerGuides from "./MultiplayerGuides";*/

export default function Canvas() {
  const {
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
  } = useCanvas(); // Получаем состояние холста из контекста
  useHotkeys(setState, setCamera, leftIsMinimized, setLeftIsMinimized); // Подключаем хук для горячих клавиш

  const { startDrawing, continueDrawing, insertPath } = useDrawingFunctions(); // Функции для рисования
  const { insertLayerByClick, insertLayerByDragging } =
    useCreateLayerFunctions();
  const {
    onResizeHandlePointerDown,
    resizeSelectedLayer,
    translateSelectedLayers,
  } = useLayerManipulation(); // Функции для изменения слоев
  const { unselectLayers, startMultiSelection, updateSelectionNet } =
    useSelectionFunctions(); // Функции для выбора

  const [isEditingText, setIsEditingText] = useState(false);

  // Обработчик прокрутки колесика мыши
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      setCamera((camera) => ({
        x: camera.x - e.deltaX, // Сдвигаем камеру по x
        y: camera.y - e.deltaY, // Сдвигаем камеру по y
        zoom: camera.zoom, // Оставляем зум без изменений
      }));
    },
    [setCamera],
  );

  // Обработчик выхода курсора за пределы холста
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  // Обработчик нажатия (нажимает указатель)
  const onPointerDown = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera); // Получаем координаты точки на холсте

      // Проверяем правый клик
      if (e.nativeEvent.button === 2) {
        setState({ mode: CanvasMode.RightClick });
        return;
      }

      // В режиме перемещения сохраняется начальная точка, от которой будет происходить движение
      if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: point });
        return;
      }

      // Режим вставки объекта игнорируем
      if (canvasState.mode === CanvasMode.Inserting) {
        unselectLayers();
        setState({
          mode: CanvasMode.CreatingShape,
          origin: point,
          current: point,
          layerType: canvasState.layerType,
          isClick: true, // Пока считаем, что это просто клик
          isShiftPressed: e.shiftKey,
          position: { x: point.x, y: point.y, width: 0, height: 0 },
        });
        return;
      }

      // В режиме рисования вызываем функцию начала рисования
      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setState, startDrawing],
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
      } else if (
        canvasState.mode === CanvasMode.CreatingShape &&
        canvasState.origin
      ) {
        const { x, y, width, height } = calculateBoundingBox(
          canvasState.origin,
          point,
          canvasState.isShiftPressed,
        );

        if ((width > 5 || height > 5) && canvasState.isClick) {
          setState((prevState) => ({
            ...prevState,
            isClick: false,
          }));
        }

        setState((prevState) => ({
          ...prevState,
          current: point,
          position: { x, y, width, height },
        }));
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

  // Обработчик нажатия (отпускает указатель)
  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent) => {
      if (canvasState.mode === CanvasMode.RightClick) return; // Проверка режима, чтобы избежать лишних действий
      const point = pointerEventToCanvasPoint(e, camera); // Получаем координаты точки на холсте

      // В зависимости от режима холста выполняем действия
      if ([CanvasMode.None, CanvasMode.Pressing].includes(canvasState.mode)) {
        unselectLayers();
        setState({ mode: CanvasMode.None });
      }
      if (canvasState.mode === CanvasMode.CreatingShape && canvasState.origin) {
        if (canvasState.isClick) {
          insertLayerByClick(canvasState.origin, canvasState.layerType);
        } else if (canvasState.position) {
          insertLayerByDragging(canvasState.position);
        }
      } else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: null });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else {
        setState({ mode: CanvasMode.None });
      }

      history.resume(); // Фиксируем завершение действия в истории
    },
    [canvasState, setState, unselectLayers, history],
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

      // Останавливаем всплытие клика
      e.stopPropagation();

      // Проверяем правый клик
      if (e.nativeEvent.button === 2) {
        if (!self.presence.selection.includes(layerId)) {
          setMyPresence(
            {
              selection: [layerId],
            },
            { addToHistory: true },
          );
        }
        setState({ mode: CanvasMode.RightClick });
        return;
      }

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence(
          {
            selection: [layerId],
          },
          { addToHistory: true },
        );
      }

      const point = pointerEventToCanvasPoint(e, camera);
      setState({ mode: CanvasMode.Translating, current: point });
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
          {/* Контекстное меню по правому клику*/}
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
                  canvasMode={canvasState.mode}
                  setIsEditingText={setIsEditingText}
                />
              ))}

              <RenderPreviewLayer canvasState={canvasState} />

              {/* Бокс с размерами для выделения слоев */}
              <SelectionBox
                onResizeHandlePointerDown={onResizeHandlePointerDown}
                isEditing={isEditingText}
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
      <Sidebars
        leftIsMinimized={leftIsMinimized}
        setLeftIsMinimized={setLeftIsMinimized}
      />
      {/*? <Sidebars roomName={roomName}
      roomId={roomId}
      othersWithAccessToRoom={othersWithAccessToRoom}
      leftIsMinimized={leftIsMinimized}
      setLeftIsMinimized={setLeftIsMinimized} />*/}
    </div>
  );
}
