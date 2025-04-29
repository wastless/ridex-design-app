"use client";

/**
 * Функциональность для манипуляции слоями на холсте
 * Предоставляет инструменты для изменения размера, перемещения и взаимодействия слоев с рамками
 */

import { useCallback, useEffect } from "react";
import {
  CanvasMode,
  LayerType,
  type Point,
  type Side,
  type XYWH,
  type FrameLayer,
} from "~/types";
import { useMutation } from "@liveblocks/react";
import { resizeBounds } from "~/utils";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";

export function useLayerManipulation() {
  const { canvasState, setState, history } = useCanvas();

  // Проверка, находится ли точка внутри слоя
  const isPointInLayer = (point: Point, layer: { x: number; y: number; width: number; height: number }) => {
    return (
      point.x >= layer.x &&
      point.x <= layer.x + layer.width &&
      point.y >= layer.y &&
      point.y <= layer.y + layer.height
    );
  };

  // Обработка нажатия и отпускания клавиши Shift во время изменения размера
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (canvasState.mode === CanvasMode.Resizing && e.key === "Shift") {
        setState((prev) => ({
          ...prev,
          isShiftPressed: true,
        }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (canvasState.mode === CanvasMode.Resizing && e.key === "Shift") {
        setState((prev) => ({
          ...prev,
          isShiftPressed: false,
        }));
      }
    };

    // Добавляем обработчики событий для клавиш
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Убираем обработчики при размонтировании компонента
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [canvasState.mode, setState]);

  // Обработчик нажатий на маркеры изменения размера
  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      // Приостанавливаем запись истории на время изменения размера
      history.pause();

      // Устанавливаем режим изменения размера
      setState((prev) => ({
        ...prev,
        mode: CanvasMode.Resizing,
        initialBounds, // Запоминаем начальные границы элемента
        corner, // Запоминаем угол, с которого началось изменение размера
        isShiftPressed: false, // Изначально Shift не нажат
      }));
    },
    [setState, history],
  );

  // Функция изменения размера выбранного слоя
  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      // Проверяем, что режим - изменение размера
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      // Вычисляем новые границы слоя с учетом начальных границ, угла и положения курсора
      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
        canvasState.isShiftPressed,
      );

      const liveLayers = storage.get("layers"); // Получаем слои из хранилища

      // Обновляем границы выбранного слоя, если он существует и выделен
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
      // Проверка, что режим - перемещение
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      // Вычисляем смещение от предыдущей до текущей позиции
      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");
      const layerIds = storage.get("layerIds");

      // Сохраняем информацию о слоях, которые находятся внутри фреймов
      // для последующей проверки, нужно ли их выносить из фрейма
      const layersToMoveOutOfFrames = new Map();

      // Проверяем для каждого выбранного слоя, находится ли он внутри какого-либо фрейма
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (!layer) continue;

        // Проверяем все фреймы, чтобы найти родительский для данного слоя
        let parentFrameId = null;
        for (const potentialParentId of layerIds) {
          const potentialParent = liveLayers.get(potentialParentId);
          if (
            potentialParent &&
            potentialParent.get("type") === LayerType.Frame
          ) {
            const frameData = potentialParent.toObject() as FrameLayer;
            const childIds = frameData.childIds ?? [];

            // Если ID слоя есть в списке дочерних элементов фрейма, то это родительский фрейм
            if (childIds.includes(id)) {
              parentFrameId = potentialParentId;
              break;
            }
          }
        }

        // Если слой находится в фрейме, сохраняем эту информацию для последующей обработки
        if (parentFrameId) {
          layersToMoveOutOfFrames.set(id, parentFrameId);
        }
      }

      // Перемещаем выбранные слои и их дочерние элементы (если это фреймы)
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (layer) {
          const currentX = layer.get("x");
          const currentY = layer.get("y");

          // Обновляем позицию слоя
          layer.update({
            x: currentX + offset.x,
            y: currentY + offset.y,
          });

          // Если слой является фреймом, необходимо переместить все его дочерние элементы
          if (layer.get("type") === LayerType.Frame) {
            const frameData = layer.toObject() as FrameLayer;
            const childIds = frameData.childIds ?? [];

            // Перемещаем каждый дочерний элемент на то же смещение
            for (const childId of childIds) {
              const childLayer = liveLayers.get(childId);
              if (childLayer) {
                const childX = childLayer.get("x");
                const childY = childLayer.get("y");

                childLayer.update({
                  x: childX + offset.x,
                  y: childY + offset.y,
                });
              }
            }
          }
        }
      }

      // Проверяем, находится ли перетаскиваемый слой над фреймом
      let isOverFrame = false;
      let frameLayerId: string | null = null;

      // Перебираем все слои, чтобы найти фреймы
      for (const id of layerIds) {
        const layer = liveLayers.get(id);

        // Если это фрейм и он не выбран в данный момент
        if (
          layer &&
          layer.get("type") === LayerType.Frame &&
          !self.presence.selection.includes(id)
        ) {
          // Проверяем для каждого выбранного слоя, находится ли его центр над фреймом
          for (const selectedId of self.presence.selection) {
            const selectedLayer = liveLayers.get(selectedId);
            if (selectedLayer) {
              // Вычисляем центр слоя после перемещения
              const centerX =
                selectedLayer.get("x") +
                offset.x +
                selectedLayer.get("width") / 2;
              const centerY =
                selectedLayer.get("y") +
                offset.y +
                selectedLayer.get("height") / 2;

              // Проверяем, находится ли центр слоя внутри фрейма
              if (
                isPointInLayer(
                  { x: centerX, y: centerY },
                  {
                    x: layer.get("x"),
                    y: layer.get("y"),
                    width: layer.get("width"),
                    height: layer.get("height"),
                  },
                )
              ) {
                isOverFrame = true;
                frameLayerId = id;
                break;
              }
            }
          }

          if (isOverFrame) break;
        }
      }

      // Обработка перемещения слоев из фрейма наружу
      for (const [
        layerId,
        parentFrameId,
      ] of layersToMoveOutOfFrames.entries()) {
        const layer = liveLayers.get(layerId as string);
        const frameLayer = liveLayers.get(parentFrameId as string);

        if (!layer || !frameLayer) continue;

        // Проверяем, находится ли центр слоя за пределами родительского фрейма
        const centerX = layer.get("x") + layer.get("width") / 2;
        const centerY = layer.get("y") + layer.get("height") / 2;

        // Проверяем, вышел ли слой за пределы родительского фрейма
        const isOutsideParentFrame = !isPointInLayer(
          { x: centerX, y: centerY },
          {
            x: frameLayer.get("x"),
            y: frameLayer.get("y"),
            width: frameLayer.get("width"),
            height: frameLayer.get("height"),
          },
        );

        // Если слой находится за пределами фрейма и не находится над другим фреймом
        // или если слой находится над другим фреймом, но не над родительским
        if (
          isOutsideParentFrame &&
          (!isOverFrame || frameLayerId !== parentFrameId)
        ) {
          // Получаем данные родительского фрейма
          const frameData = frameLayer.toObject() as FrameLayer;
          const childIds = [...(frameData.childIds ?? [])];

          // Удаляем ID слоя из дочерних элементов родительского фрейма
          const index = childIds.indexOf(layerId as string);
          if (index !== -1) {
            childIds.splice(index, 1);

            // Обновляем список дочерних элементов фрейма
            frameLayer.update({
              childIds: childIds,
            });

            // Добавляем слой в список слоев верхнего уровня, если он не будет добавлен в другой фрейм
            if (!isOverFrame || frameLayerId !== parentFrameId) {
              // Проверяем, есть ли уже этот слой в списке верхнеуровневых слоев
              const layerIdsArray = layerIds.toArray();
              if (!layerIdsArray.includes(layerId as string)) {
                // Добавляем слой в конец списка слоев верхнего уровня
                layerIds.push(layerId as string);
              }
            }
          }
        }
      }

      // Если слой перемещается над фреймом, добавляем его в дочерние элементы и удаляем из верхнего уровня
      if (isOverFrame && frameLayerId) {
        for (const id of self.presence.selection) {
          const selectedLayer = liveLayers.get(id);

          if (!selectedLayer) continue;

          // Проверяем, что это не фрейм (фреймы нельзя вкладывать в другие фреймы)
          const selectedLayerType = selectedLayer.get("type");

          if (selectedLayerType !== LayerType.Frame) {
            const frameLayer = liveLayers.get(frameLayerId);

            if (!frameLayer) continue;

            // Проверяем, что это действительно фрейм
            const frameLayerType = frameLayer.get("type");

            if (frameLayerType === LayerType.Frame) {
              // Получаем объект фрейма, чтобы работать с массивом childIds
              const frameData = frameLayer.toObject() as FrameLayer;
              const childIds = frameData.childIds ?? [];

              // Добавляем ID слоя в массив дочерних элементов, если его там нет
              if (!childIds.includes(id)) {
                // Обновляем фрейм с новым массивом дочерних элементов
                frameLayer.update({
                  childIds: [...childIds, id] as string[],
                });

                // Удаляем слой из списка слоев верхнего уровня, так как теперь он дочерний элемент фрейма
                const index = layerIds.indexOf(id);
                if (index !== -1) {
                  layerIds.delete(index);
                }
              }
            }
          }
        }
      }

      // Обновляем текущую позицию в состоянии холста
      setState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );

  return {
    onResizeHandlePointerDown,
    resizeSelectedLayer,
    translateSelectedLayers,
  };
}
