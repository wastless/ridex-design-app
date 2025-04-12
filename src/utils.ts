import {
  Camera,
  Color,
  Layer,
  LayerType,
  PathLayer,
  Point,
  Side, TextLayer,
  XYWH,
} from "./types";
import {LiveObject} from "@liveblocks/client";

// Функция преобразования цвета в формат CSS (hex)
export function colorToCss(color: Color | null | undefined) {
  if (!color) return "#CCC";
  const r = color.r?.toString(16).padStart(2, "0") || "00";
  const g = color.g?.toString(16).padStart(2, "0") || "00";
  const b = color.b?.toString(16).padStart(2, "0") || "00";
  const a = color.a !== undefined ? color.a.toString(16).padStart(2, "0") : "ff";
  return `#${r}${g}${b}${a}`;
}

export function hexToRgb(hex: string): Color {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Check if the hex includes alpha channel (8 digits)
  if (cleanHex.length >= 8) {
    // Parse the hex values into r,g,b,a components
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const a = parseInt(cleanHex.substring(6, 8), 16);

    return {
      r,
      g,
      b,
      a
    };
  } else {
    // Parse the hex values into r,g,b components (no alpha)
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return {
      r,
      g,
      b
    };
  }
}

// Функция для преобразования события указателя в точку холста с учетом камеры
export const pointerEventToCanvasPoint = (
    e: React.PointerEvent,
    camera: Camera,
): Point => {
  return {
    x: (Math.round(e.clientX) - camera.x) / camera.zoom,
    y: (Math.round(e.clientY) - camera.y) / camera.zoom,
  };
};



// Функция для преобразование массива точек, нарисованных карандашом, в объект слоя, который можно добавить на холст
export function penPointsToPathPayer(points: number[][], color: Color): PathLayer {
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

// Функция для преобразования массива точек в путь SVG
export function getSvgPathFromStroke(stroke: number[][]) {
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

export function resizeBounds(bounds: XYWH, corner: Side, point: Point, isShiftPressed: boolean): XYWH {
  let { x, y, width, height } = bounds;

  // Определяем фиксированную точку (противоположный угол)
  let fixedX = x;
  let fixedY = y;

  if (corner === Side.Right || (corner & Side.Right) !== 0) {
    fixedX = x;
  } else if (corner === Side.Left || (corner & Side.Left) !== 0) {
    fixedX = x + width;
  }

  if (corner === Side.Bottom || (corner & Side.Bottom) !== 0) {
    fixedY = y;
  } else if (corner === Side.Top || (corner & Side.Top) !== 0) {
    fixedY = y + height;
  }

  // Вычисляем новую ширину и высоту
  let newWidth = Math.abs(point.x - fixedX);
  let newHeight = Math.abs(point.y - fixedY);

  // Если зажат Shift — делаем пропорциональное изменение
  if (isShiftPressed) {
    const maxSide = Math.max(newWidth, newHeight);
    newWidth = maxSide;
    newHeight = maxSide;
  }

  // Обновляем координаты (фигура должна двигаться)
  const newX = fixedX < point.x ? fixedX : fixedX - newWidth;
  const newY = fixedY < point.y ? fixedY : fixedY - newHeight;

  return { x: newX, y: newY, width: newWidth, height: newHeight };
}


// Функция находимт слои, которые пересекаются с прямоугольником
export function findIntersectionLayersWithRectangle(layerIds: readonly string[], layers: ReadonlyMap<string, Layer>, a: Point, b: Point) {
  // Определяет границы прямоугольника выделения
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids = []; // Массив для хранения id слоев

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


export function calculateBoundingBox(origin: Point, current: Point, isShiftPressed: boolean) {
  let width = Math.abs(current.x - origin.x);
  let height = Math.abs(current.y - origin.y);

  if (isShiftPressed) {
    const size = Math.max(width, height);
    width = size;
    height = size;
  }

  return {
    x: Math.min(origin.x, current.x),
    y: Math.min(origin.y, current.y),
    width,
    height,
  };
}




