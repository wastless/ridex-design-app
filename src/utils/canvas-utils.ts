/**
 * Утилиты для работы с холстом
 * Содержит функции для манипулирования холстом, обработки событий указателя
 * и расчета прямоугольных областей
 */
import type { Camera, Point, XYWH } from "../types";

/**
 * Преобразует событие указателя в точку холста с учетом камеры
 *
 * @param e Событие указателя или колесика мыши
 * @param camera Объект камеры с координатами и масштабом
 * @returns Точка в координатах холста
 */
export const pointerEventToCanvasPoint = (
  e: React.PointerEvent | React.WheelEvent,
  camera: Camera,
): Point => {
  const svg = document.querySelector("svg");
  if (!svg) return { x: 0, y: 0 };

  const rect = svg.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  return {
    x: (x - camera.x) / camera.zoom,
    y: (y - camera.y) / camera.zoom,
  };
};

/**
 * Рассчитывает ограничивающий прямоугольник между двумя точками
 * с поддержкой соблюдения пропорций при зажатой клавише Shift
 *
 * @param origin Начальная точка
 * @param current Текущая точка
 * @param isShiftPressed Нажата ли клавиша Shift
 * @returns Объект с координатами и размерами прямоугольника
 */
export function calculateBoundingBox(
  origin: Point,
  current: Point,
  isShiftPressed: boolean,
): XYWH {
  let width = Math.abs(current.x - origin.x);
  let height = Math.abs(current.y - origin.y);

  if (isShiftPressed) {
    // Вычисляем соотношение сторон на основе направления перетаскивания
    const deltaX = current.x - origin.x;
    const deltaY = current.y - origin.y;

    // Определяем, какое измерение должно быть ведущим на основе того, какое изменилось больше
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Ширина ведущая, подстраиваем высоту
      height = (width * (deltaY >= 0 ? 1 : -1)) / (deltaX >= 0 ? 1 : -1);
    } else {
      // Высота ведущая, подстраиваем ширину
      width = (height * (deltaX >= 0 ? 1 : -1)) / (deltaY >= 0 ? 1 : -1);
    }

    // Пересчитываем ширину/высоту, чтобы они были положительными
    width = Math.abs(width);
    height = Math.abs(height);
  }

  return {
    x: Math.min(origin.x, current.x),
    y: Math.min(origin.y, current.y),
    width,
    height,
  };
}
