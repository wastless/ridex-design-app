/**
 * Утилиты для работы со слоями
 * Содержит функции для манипулирования слоями, генерации имен слоев
 * и другие вспомогательные функции
 */
import type { PathLayer, Color, Point, XYWH, Layer } from "../types";
import { LayerType } from "../types";

// Хранилище для счетчиков слоёв по комнатам
const roomLayerCounters = new Map<string, Map<LayerType, number>>();

/**
 * Генерирует имя слоя на основе его типа и id.
 * Обеспечивает стабильную нумерацию в пределах каждой комнаты,
 * начиная с 1 для каждого типа слоя в новой комнате.
 *
 * @param layerId ID слоя
 * @param layerType Тип слоя (Rectangle, Ellipse, и т.д.)
 * @param roomId ID комнаты
 * @returns Строка с названием слоя, включающая номер
 */
export function generateLayerName(
  layerId: string,
  layerType: LayerType,
  roomId: string,
): string {
  // Инициализируем счетчики для комнаты, если они не существуют
  if (!roomLayerCounters.has(roomId)) {
    roomLayerCounters.set(roomId, new Map<LayerType, number>());
  }

  const roomCounters = roomLayerCounters.get(roomId)!;

  // Если слой с таким ID уже был обработан, вернем запомненное имя
  const layerNumberKey = `${layerId}-number`;
  const existingNumber = localStorage.getItem(layerNumberKey);

  if (existingNumber) {
    return formatLayerName(layerType, parseInt(existingNumber));
  }

  // Увеличиваем счетчик для данного типа слоев
  const currentCount = (roomCounters.get(layerType) ?? 0) + 1;
  roomCounters.set(layerType, currentCount);

  // Сохраняем номер слоя в localStorage для стабильности между перезагрузками
  localStorage.setItem(layerNumberKey, currentCount.toString());

  return formatLayerName(layerType, currentCount);
}

/**
 * Форматирует имя слоя в зависимости от его типа и номера
 *
 * @param layerType Тип слоя
 * @param number Номер слоя
 * @returns Отформатированное имя слоя
 */
function formatLayerName(layerType: LayerType, number: number): string {
  switch (layerType) {
    case LayerType.Rectangle:
      return `Прямоугольник ${number}`;
    case LayerType.Ellipse:
      return `Эллипс ${number}`;
    case LayerType.Triangle:
      return `Треугольник ${number}`;
    case LayerType.Path:
      return `Векторный путь ${number}`;
    case LayerType.Text:
      return `Текст ${number}`;
    case LayerType.Frame:
      return `Холст ${number}`;
    case LayerType.Image:
      return `Изображение ${number}`;
    default:
      return `Слой ${number}`;
  }
}

/**
 * Очищает счетчики слоёв для указанной комнаты
 * Вызывать при создании новой комнаты
 *
 * @param roomId ID комнаты
 */
export function resetRoomLayerCounters(roomId: string): void {
  roomLayerCounters.delete(roomId);

  // Очищаем localStorage от старых значений для этой комнаты
  for (const key of Object.keys(localStorage)) {
    if (
      key.includes("-number") &&
      localStorage.getItem(`${key}-room`) === roomId
    ) {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}-room`);
    }
  }
}

/**
 * Преобразует массив точек, нарисованных карандашом, в объект слоя PathLayer
 *
 * @param points Массив точек с координатами
 * @param color Цвет линии
 * @returns Объект слоя типа PathLayer
 */
export function penPointsToPathPayer(
  points: number[][],
  color: Color,
): PathLayer {
  // Вычисляет границы пути
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  // Определяет границы пути, чтобы узнать размеры рисунка
  for (const point of points) {
    const [x, y] = point;
    if (x === undefined || y === undefined) continue;

    if (left > x) {
      left = x;
    }
    if (top > y) {
      top = y;
    }
    if (right < x) {
      right = x;
    }
    if (bottom < y) {
      bottom = y;
    }
  }

  return {
    type: LayerType.Path,

    // Область рисунка
    x: left,
    y: top,
    height: bottom - top,
    width: right - left,

    fill: color,
    stroke: null,
    opacity: 100,

    // Фильтрует точки, удаляя те, которые не содержат координаты
    points: points
      .filter(
        (point): point is [number, number, number] =>
          point[0] !== undefined &&
          point[1] !== undefined &&
          point[2] !== undefined,
      )
      .map(([x, y, pressure]) => [x - left, y - top, pressure]), // Трансформирует точки, чтобы они начинались с 0,0
  };
}

/**
 * Преобразует массив точек в путь SVG
 *
 * @param stroke Массив точек, представляющих линию
 * @returns Строка с SVG-путем для отрисовки линии
 */
export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return ""; // Если массив пустой, возвращает пустую строку

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const nextPoint = arr[(i + 1) % arr.length]; // Берет следующую точку

      if (!nextPoint) return acc;

      const [x1, y1] = nextPoint;
      acc.push(x0!, y0!, (x0! + x1!) / 2, (y0! + y1!) / 2); // Добавляет кривую Безье
      return acc;
    },
    ["M", ...(stroke[0] ?? []), "Q"], // Начинает путь с первой точки
  );

  d.push("Z"); // Закрывает путь
  return d.join(" ");
}

/**
 * Находит слои, которые пересекаются с прямоугольником выделения
 *
 * @param layerIds Массив ID слоев для проверки
 * @param layers Карта всех слоев
 * @param a Начальная точка прямоугольника
 * @param b Конечная точка прямоугольника
 * @returns Массив ID слоев, пересекающихся с прямоугольником
 */
export function findIntersectionLayersWithRectangle(
  layerIds: readonly string[],
  layers: ReadonlyMap<string, Layer>,
  a: Point,
  b: Point,
): string[] {
  // Определяет границы прямоугольника выделения
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids: string[] = []; // Массив для хранения id слоев

  // Проверяем каждый слой на пересечение
  for (const layerId of layerIds) {
    const layer = layers.get(layerId);

    if (layer == null) continue; // Пропускаем, если слой не найден

    const { x, y, height, width } = layer; // Координаты и размеры слоя

    // Проверяем пересечение слоя с прямоугольником выделения
    if (
      rect.x + rect.width > x &&
      rect.x < x + width &&
      rect.y + rect.height > y &&
      rect.y < y + height
    ) {
      ids.push(layerId); // Добавляем слой в массив
    }
  }

  return ids;
}

/**
 * Изменяет размеры границ слоя, перетаскивая за угол или сторону
 *
 * @param bounds Текущие границы слоя
 * @param corner Угол/сторона, за которую перетаскивается слой
 * @param point Новая точка, до которой перетаскивается
 * @param isShiftPressed Нажата ли клавиша Shift (для сохранения пропорций)
 * @returns Новые границы слоя
 */
export function resizeBounds(
  bounds: XYWH,
  corner: number,
  point: Point,
  isShiftPressed: boolean,
): XYWH {
  const { x, y, width, height } = bounds;

  // Store original aspect ratio
  const originalAspectRatio = width / height;

  // Определяем фиксированную точку (противоположный угол)
  let fixedX = x;
  let fixedY = y;

  if (corner === 8 || (corner & 8) !== 0) {
    fixedX = x;
  } else if (corner === 4 || (corner & 4) !== 0) {
    fixedX = x + width;
  }

  if (corner === 2 || (corner & 2) !== 0) {
    fixedY = y;
  } else if (corner === 1 || (corner & 1) !== 0) {
    fixedY = y + height;
  }

  // Вычисляем новую ширину и высоту
  let newWidth = Math.abs(point.x - fixedX);
  let newHeight = Math.abs(point.y - fixedY);

  // Если зажат Shift — делаем пропорциональное изменение относительно оригинального соотношения сторон
  if (isShiftPressed) {
    // Определяем, какая сторона изменилась больше относительно исходного размера
    if (
      corner === 8 ||
      corner === 4 ||
      (corner & 8) !== 0 ||
      (corner & 4) !== 0
    ) {
      // Если изменяется ширина, подстраиваем высоту
      newHeight = newWidth / originalAspectRatio;
    } else {
      // Если изменяется высота, подстраиваем ширину
      newWidth = newHeight * originalAspectRatio;
    }

    // Для углов нужно определить, какая сторона лидирует
    if (
      ((corner & 8) !== 0 && (corner & 2) !== 0) ||
      ((corner & 4) !== 0 && (corner & 1) !== 0) ||
      ((corner & 8) !== 0 && (corner & 1) !== 0) ||
      ((corner & 4) !== 0 && (corner & 2) !== 0)
    ) {
      const widthRatio = newWidth / width;
      const heightRatio = newHeight / height;

      // Используем большее изменение как основу
      if (Math.abs(widthRatio) > Math.abs(heightRatio)) {
        newHeight = newWidth / originalAspectRatio;
      } else {
        newWidth = newHeight * originalAspectRatio;
      }
    }
  }

  // Обновляем координаты (фигура должна двигаться)
  const newX = fixedX < point.x ? fixedX : fixedX - newWidth;
  const newY = fixedY < point.y ? fixedY : fixedY - newHeight;

  return { x: newX, y: newY, width: newWidth, height: newHeight };
}
