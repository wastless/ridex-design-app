"use client";

/**
 * Основной компонент редактора дизайна
 * Отвечает за отрисовку холста, обработку взаимодействий пользователя с холстом,
 * и управление слоями и объектами на холсте
 */

import { useMutation } from "@liveblocks/react";
import {
  calculateBoundingBox,
  colorToCss,
  pointerEventToCanvasPoint,
} from "~/utils";
import { CanvasMode, LayerType, type Point } from "~/types";
import { useState, useRef, useEffect } from "react";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { useDrawingFunctions } from "~/components/canvas/helper/DrawingFunctions";
import { useLayerManipulation } from "~/components/canvas/helper/LayerManipulation";
import { useSelectionFunctions } from "~/components/canvas/helper/SelectionFunctions";
import { useCreateLayerFunctions } from "~/components/canvas/helper/ShapeDrawingFunctions";

import LayerComponent from "./LayerComponent";
import Path from "./shapes/Path";
import SelectionBox from "./SelectionBox";
import SelectionTools from "~/components/canvas/SelectionTools";
import ToolsBar from "~/components/panels/ToolsBar";
import { useHotkeys } from "~/hooks/use-hotkeys";
import RenderPreviewLayer from "~/components/canvas/helper/RenderPreviewLayer";
import Sidebars from "~/components/panels/UICanvas";
import { useZoom } from "~/hooks/use-zoom";
import MultiplayerGuides from "./MultiplayerGuides";
import type { User } from "@prisma/client";

export default function Canvas({
  roomName,
  roomId,
  othersWithAccessToRoom,
  owner,
}: {
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: User[];
  owner: User;
}) {
  const svgRef = useRef<SVGSVGElement>(null); // Ссылка на SVG элемент

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

  useZoom(camera, setCamera, svgRef);
  useHotkeys(setState, setCamera, leftIsMinimized, setLeftIsMinimized); // Подключаем хук для горячих клавиш

  const { startDrawing, continueDrawing, insertPath } = useDrawingFunctions(); // Функции для рисования
  const { insertLayerByClick, insertLayerByDragging } =
    useCreateLayerFunctions(); // Функции для создания слоев
  const {
    onResizeHandlePointerDown,
    resizeSelectedLayer,
    translateSelectedLayers,
  } = useLayerManipulation(); // Функции для изменения слоев
  const { unselectLayers, startMultiSelection, updateSelectionNet } =
    useSelectionFunctions(); // Функции для выбора

  const [isEditingText, setIsEditingText] = useState(false); // Состояние редактирования текста

  // Состояния для перемещения холста
  const [isDragging, setIsDragging] = useState(false);
  const [previousMode, setPreviousMode] = useState<CanvasMode | null>(null);
  const [lastMousePosition, setLastMousePosition] = useState<Point | null>(
    null,
  );

  // Добавляем обработчики событий для клавиши Shift при создании или изменении размеров фигур
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (canvasState.mode === CanvasMode.CreatingShape ||
          canvasState.mode === CanvasMode.Resizing) &&
        e.key === "Shift"
      ) {
        setState((prev) => ({
          ...prev,
          isShiftPressed: true,
        }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        (canvasState.mode === CanvasMode.CreatingShape ||
          canvasState.mode === CanvasMode.Resizing) &&
        e.key === "Shift"
      ) {
        setState((prev) => ({
          ...prev,
          isShiftPressed: false,
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [canvasState.mode, setState]);

  // Обработчики для перемещения холста с помощью средней кнопки мыши
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        // Средняя кнопка мыши
        e.preventDefault();
        setIsDragging(true);
        setLastMousePosition({ x: e.clientX, y: e.clientY });
        setPreviousMode(canvasState.mode);
        setState({ mode: CanvasMode.Dragging, origin: null });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && lastMousePosition) {
        e.preventDefault();

        const deltaX = e.clientX - lastMousePosition.x;
        const deltaY = e.clientY - lastMousePosition.y;

        // Используем requestAnimationFrame для плавного обновления
        requestAnimationFrame(() => {
          setCamera((camera) => ({
            x: camera.x + deltaX,
            y: camera.y + deltaY,
            zoom: camera.zoom,
          }));
        });

        setLastMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        setIsDragging(false);
        setLastMousePosition(null);
        if (previousMode !== null) {
          switch (previousMode) {
            case CanvasMode.None:
              setState({ mode: CanvasMode.None });
              break;
            case CanvasMode.Dragging:
              setState({ mode: CanvasMode.Dragging, origin: null });
              break;
            case CanvasMode.Pencil:
              setState({ mode: CanvasMode.Pencil });
              break;
            case CanvasMode.Inserting:
              setState({
                mode: CanvasMode.Inserting,
                layerType: LayerType.Rectangle,
              });
              break;
            default:
              setState({ mode: CanvasMode.None });
          }
          setPreviousMode(null);
        }
      }
    };

    svg.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      svg.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    camera,
    setCamera,
    canvasState.mode,
    setState,
    previousMode,
    isDragging,
    lastMousePosition,
  ]);

  // Обработчик выхода курсора за пределы холста
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  // Обработчик нажатия указателя
  const onPointerDown = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera); // Получаем координаты точки на холсте

      // Проверяем правый клик
      if (e.nativeEvent.button === 2) {
        setState({ mode: CanvasMode.RightClick });
        return;
      }

      // В режиме перемещения сохраняем начальную точку, от которой будет происходить движение
      if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: point });
        return;
      }

      // Режим вставки объекта
      if (canvasState.mode === CanvasMode.Inserting) {
        unselectLayers();

        // Для всех типов слоев, включая изображения, используем одинаковый подход
        setState({
          mode: CanvasMode.CreatingShape,
          origin: point,
          current: point,
          layerType: canvasState.layerType,
          isClick: true, // Пока считаем, что это просто клик
          isShiftPressed: e.shiftKey,
          position: { x: point.x, y: point.y, width: 0, height: 0 },
          // Передаем данные изображения, если они есть
          ...("imageData" in canvasState
            ? { imageData: canvasState.imageData }
            : {}),
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
    [camera, canvasState.mode, setState, startDrawing, unselectLayers],
  );

  // Обработчик движения указателя
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Pressing) {
        // Начало множественного выделения
        startMultiSelection(point, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        // Обновление сети выделения
        updateSelectionNet(point, canvasState.origin);
      } else if (
        canvasState.mode === CanvasMode.Dragging &&
        canvasState.origin !== null
      ) {
        // Перемещение холста
        const deltaX = e.movementX;
        const deltaY = e.movementY;

        // Используем requestAnimationFrame для плавного обновления
        requestAnimationFrame(() => {
          setCamera((camera) => ({
            x: camera.x + deltaX,
            y: camera.y + deltaY,
            zoom: camera.zoom,
          }));
        });
      } else if (canvasState.mode === CanvasMode.Translating) {
        // Перемещение выбранных слоев
        translateSelectedLayers(point);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        // Продолжение рисования
        continueDrawing(point, e);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        // Изменение размера выбранного слоя
        resizeSelectedLayer(point);
      } else if (
        canvasState.mode === CanvasMode.CreatingShape &&
        canvasState.origin
      ) {
        // Создание новой фигуры
        const { x, y, width, height } = calculateBoundingBox(
          canvasState.origin,
          point,
          canvasState.isShiftPressed,
        );

        // Проверяем, что это не простой клик
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

      // Обновляем позицию курсора для других пользователей
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

  // Обработчик отпускания указателя
  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent) => {
      if (canvasState.mode === CanvasMode.RightClick) return;

      if ([CanvasMode.None, CanvasMode.Pressing].includes(canvasState.mode)) {
        // Отменяем выбор слоев и сбрасываем режим
        unselectLayers();
        setState({ mode: CanvasMode.None });
      } else if (
        canvasState.mode === CanvasMode.CreatingShape &&
        canvasState.origin
      ) {
        // Создание нового слоя
        if (
          canvasState.isClick ||
          ("layerType" in canvasState &&
            canvasState.layerType === LayerType.Image)
        ) {
          // Для простого клика или изображения
          insertLayerByClick(canvasState.origin, canvasState.layerType);
        } else if (
          canvasState.position &&
          "layerType" in canvasState &&
          canvasState.layerType !== LayerType.Image
        ) {
          // Для создания фигуры перетаскиванием
          insertLayerByDragging(canvasState.position);
        }
      } else if (canvasState.mode === CanvasMode.Dragging) {
        // Сброс начальной точки при окончании перетаскивания
        setState({ mode: CanvasMode.Dragging, origin: null });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        // Вставка нарисованного пути
        insertPath();
      } else {
        // Сброс режима по умолчанию
        setState({ mode: CanvasMode.None });
      }

      // Возобновляем запись истории
      history.resume();
    },
    [
      canvasState,
      setState,
      unselectLayers,
      history,
      insertLayerByClick,
      insertLayerByDragging,
      insertPath,
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

      // Выбираем слой, если он еще не выбран
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence(
          {
            selection: [layerId],
          },
          { addToHistory: true },
        );
      }

      // Начинаем перемещение слоя
      const point = pointerEventToCanvasPoint(e, camera);
      setState({ mode: CanvasMode.Translating, current: point });
    },
    [camera, canvasState.mode, history, setState],
  );

  return (
    <div className="flex h-screen w-full">
      <main className="fixed left-0 right-0 h-screen overflow-y-auto">
        {/* Контейнер с цветом фона, основанным на roomColor или дефолтном значении */}
        <div
          style={{
            backgroundColor: roomColor ? colorToCss(roomColor) : "#efefef",
          }}
          className="h-full w-full touch-none select-none"
        >
          {/* Контекстное меню по правому клику */}
          <SelectionTools camera={camera} canvasMode={canvasState.mode} />

          {/* SVG-элемент для рендеринга графики */}
          <svg
            ref={svgRef}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className="h-full w-full touch-none select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ touchAction: "none" }}
          >
            {/* Группа для рендеринга слоев с трансформацией для камеры */}
            <g
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
              }}
            >
              {/* Отображаем все слои */}
              {layerIds?.map((layerId) => (
                <LayerComponent
                  key={layerId}
                  id={layerId}
                  onLayerPointerDown={onLayerPointerDown}
                  canvasMode={canvasState.mode}
                  setIsEditingText={setIsEditingText}
                />
              ))}

              {/* Предпросмотр создаваемого слоя */}
              <RenderPreviewLayer canvasState={canvasState} />

              {/* Бокс с размерами для выделения слоев */}
              <SelectionBox
                onResizeHandlePointerDown={onResizeHandlePointerDown}
                isEditing={isEditingText}
              />

              {/* Прямоугольник выделения при множественном выборе */}
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

              {/* Отображение указателей других пользователей */}
              <MultiplayerGuides />

              {/* Отображение черновика при рисовании карандашом */}
              {pencilDraft !== null && pencilDraft.length > 0 && (
                <Path
                  x={0}
                  y={0}
                  opacity={100}
                  fill={colorToCss({ r: 0, g: 0, b: 0 })}
                  points={pencilDraft}
                  canvasMode={canvasState.mode}
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
      />

      {/* Боковые панели */}
      <Sidebars
        roomName={roomName}
        roomId={roomId}
        othersWithAccessToRoom={othersWithAccessToRoom}
        leftIsMinimized={leftIsMinimized}
        setLeftIsMinimized={setLeftIsMinimized}
        owner={owner}
      />
    </div>
  );
}
