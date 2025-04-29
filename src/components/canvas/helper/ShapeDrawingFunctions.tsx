"use client";

/**
 * Функциональность для создания и добавления новых слоев на холст
 * Обеспечивает создание различных типов слоев с возможностью вставки как с помощью клика, так и перетаскивания
 */

import { useMutation } from "@liveblocks/react";
import { type LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import { CanvasMode, LayerType, type Point, type Layer, type ImageDataEvent } from "~/types";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { createLayer } from "~/components/canvas/helper/LayerFactory";
import { useEffect, useRef } from "react";

export function useCreateLayerFunctions() {
  const { canvasState, setState, MAX_LAYERS } = useCanvas();

  // Хранилище данных изображения
  const imageDataRef = useRef<ImageDataEvent | null>(null);

  // Обработчик события для получения данных изображения
  useEffect(() => {
    const handleImageDataReady = (event: CustomEvent<ImageDataEvent>) => {
      imageDataRef.current = event.detail;
    };

    window.addEventListener(
      "imageDataReady",
      handleImageDataReady as EventListener,
    );

    return () => {
      window.removeEventListener(
        "imageDataReady",
        handleImageDataReady as EventListener,
      );
    };
  }, []);

  // Вставка слоя (фигуры или текста) одним кликом
  const insertLayerByClick = useMutation(
    ({ storage, setMyPresence }, point: Point, layerType: LayerType) => {
      const liveLayers = storage.get("layers");
      // Проверка на максимальное количество слоев
      if (liveLayers.size >= MAX_LAYERS) return;

      const layerId = nanoid();
      let layer: LiveObject<Layer> | null;

      if (layerType === LayerType.Text) {
        // Создание пустого текстового блока с минимальными размерами
        layer = createLayer(layerType, point.x, point.y, 10, 20, "", false);

        // Устанавливаем слой в режим редактирования сразу после создания
        if (layer) {
          storage.get("layerIds").push(layerId);
          liveLayers.set(layerId, layer);
          setMyPresence({ selection: [layerId] }, { addToHistory: true });
          setState({ mode: CanvasMode.None });
        }
      } else if (layerType === LayerType.Frame) {
        // Рамки создаются с фиксированным размером
        const size = 200;
        layer = createLayer(
          layerType,
          point.x - size / 2,
          point.y - size / 2,
          size,
          size,
        );

        if (layer) {
          storage.get("layerIds").push(layerId);
          liveLayers.set(layerId, layer);
          setMyPresence({ selection: [layerId] }, { addToHistory: true });
          setState({ mode: CanvasMode.None });
        }
      } else if (layerType === LayerType.Image) {
        // Получаем данные изображения из useRef
        const imageData = imageDataRef.current;

        if (imageData) {
          const { width, height, url, aspectRatio } = imageData;

          // Создаем слой изображения и центрируем его относительно точки клика
          layer = createLayer(
            layerType,
            point.x - width / 2,
            point.y - height / 2,
            width,
            height,
            undefined,
            false,
            url,
            aspectRatio,
          );

          if (layer) {
            storage.get("layerIds").push(layerId);
            liveLayers.set(layerId, layer);
            setMyPresence({ selection: [layerId] }, { addToHistory: true });
            setState({ mode: CanvasMode.None });

            // Очищаем данные изображения после использования
            imageDataRef.current = null;
          }
        } else {
          console.error("Не найдены данные изображения для создания слоя");
        }
      } else {
        // Фигуры создаются с фиксированным размером
        const size = 100;
        layer = createLayer(
          layerType,
          point.x - size / 2,
          point.y - size / 2,
          size,
          size,
        );

        if (layer) {
          storage.get("layerIds").push(layerId);
          liveLayers.set(layerId, layer);
          setMyPresence({ selection: [layerId] }, { addToHistory: true });
          setState({ mode: CanvasMode.None });
        }
      }
    },
    [],
  );

  // Завершение рисования фигуры или текста (тянущийся клик)
  const insertLayerByDragging = useMutation(
    (
      { storage, setMyPresence },
      position: { x: number; y: number; width: number; height: number },
    ) => {
      if (
        canvasState.mode !== CanvasMode.CreatingShape ||
        !canvasState.origin ||
        !canvasState.current
      ) {
        return;
      }

      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) return;

      const layerId = nanoid();
      let layer: LiveObject<Layer> | null;

      if (canvasState.layerType === LayerType.Text) {
        // Текстовый блок с фиксированной шириной и переносом строк
        layer = createLayer(
          canvasState.layerType,
          position.x,
          position.y,
          10,
          20,
          "",
          false,
        );
      } else if (canvasState.layerType === LayerType.Image) {
        // Для изображений мы используем только вставку одиночным кликом
        // При попытке вставить изображение перетаскиванием - отменяем операцию
        setState({ mode: CanvasMode.None });
        imageDataRef.current = null; // Очищаем данные изображения
        return;
      } else {
        // Обработка рамок и других фигур
        layer = createLayer(
          canvasState.layerType,
          position.x,
          position.y,
          position.width,
          position.height,
        );
      }

      if (layer) {
        storage.get("layerIds").push(layerId);
        liveLayers.set(layerId, layer);
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }

      setState({ mode: CanvasMode.None });
    },
    [canvasState, setState],
  );

  return {
    insertLayerByClick,
    insertLayerByDragging,
  };
}
