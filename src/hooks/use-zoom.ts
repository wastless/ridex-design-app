"use client";

/**
 * Хук для управления масштабированием и панорамированием холста
 * Позволяет изменять масштаб и положение холста с помощью колесика мыши или программно
 */

import { useCallback, useEffect } from "react";
import type { Camera } from "~/types";
import { pointerEventToCanvasPoint } from "~/utils";

const MIN_ZOOM = 0.02; // Минимальный масштаб 2%
const MAX_ZOOM = 10; // Максимальный масштаб 1000%

/**
 * Хук для управления масштабированием и перемещением по холсту
 *
 * @param camera - Текущее состояние камеры (позиция и масштаб)
 * @param setCamera - Функция для обновления состояния камеры
 * @param svgRef - Ссылка на SVG-элемент холста
 * @returns Объект с функциями для управления масштабом
 */
export const useZoom = (
  camera: Camera,
  setCamera: (updater: (prev: Camera) => Camera) => void,
  svgRef: React.RefObject<SVGSVGElement>,
) => {
  /**
   * Обработчик события прокрутки колеса мыши
   * Изменяет масштаб при зажатом Ctrl или перемещает холст
   */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // Предотвращаем стандартное поведение браузера
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey) {
        // Масштабирование при зажатом Ctrl
        const point = pointerEventToCanvasPoint(
          e as unknown as React.WheelEvent,
          camera,
        );
        const zoomFactor = 1.2;
        const delta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;

        setCamera((prev: Camera) => {
          const newZoom = Math.min(
            Math.max(prev.zoom * delta, MIN_ZOOM),
            MAX_ZOOM,
          );

          // Рассчитываем смещение для зума относительно курсора
          const dx = point.x * (1 - delta);
          const dy = point.y * (1 - delta);

          return {
            x: prev.x + dx * prev.zoom,
            y: prev.y + dy * prev.zoom,
            zoom: newZoom,
          };
        });
      } else {
        // Панорамирование холста при обычной прокрутке
        const deltaX = e.shiftKey ? e.deltaY : e.deltaX;
        const deltaY = e.shiftKey ? 0 : e.deltaY;

        setCamera((prev: Camera) => ({
          x: prev.x - deltaX,
          y: prev.y - deltaY,
          zoom: prev.zoom,
        }));
      }
    },
    [camera, setCamera],
  );

  // Добавляем обработчик события прокрутки к SVG-элементу
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      svg.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel, svgRef]);

  /**
   * Увеличение масштаба холста
   * Масштабирование происходит относительно центра видимой области
   */
  const zoomIn = useCallback(() => {
    const svg = document.querySelector("svg");
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const centerPoint = {
        x: (rect.width / 2 - camera.x) / camera.zoom,
        y: (rect.height / 2 - camera.y) / camera.zoom,
      };
      const zoomFactor = 1.2;

      setCamera((prev: Camera) => {
        const newZoom = Math.min(prev.zoom * zoomFactor, MAX_ZOOM);
        const dx = centerPoint.x * (1 - zoomFactor);
        const dy = centerPoint.y * (1 - zoomFactor);

        return {
          x: prev.x + dx * prev.zoom,
          y: prev.y + dy * prev.zoom,
          zoom: newZoom,
        };
      });
    }
  }, [camera, setCamera]);

  /**
   * Уменьшение масштаба холста
   * Масштабирование происходит относительно центра видимой области
   */
  const zoomOut = useCallback(() => {
    const svg = document.querySelector("svg");
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const centerPoint = {
        x: (rect.width / 2 - camera.x) / camera.zoom,
        y: (rect.height / 2 - camera.y) / camera.zoom,
      };
      const zoomFactor = 1 / 1.2;

      setCamera((prev: Camera) => {
        const newZoom = Math.max(prev.zoom * zoomFactor, MIN_ZOOM);
        const dx = centerPoint.x * (1 - zoomFactor);
        const dy = centerPoint.y * (1 - zoomFactor);

        return {
          x: prev.x + dx * prev.zoom,
          y: prev.y + dy * prev.zoom,
          zoom: newZoom,
        };
      });
    }
  }, [camera, setCamera]);

  return { zoomIn, zoomOut };
};