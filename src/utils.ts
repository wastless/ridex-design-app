import { Camera, Color, LayerType, PathLayer, Point } from "./types";

// Функция преобразования цвета в формат CSS (hex)
export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

// Функция для преобразования события указателя в точку холста с учетом камеры
export const pointerEventToCanvasPoint = (
  e: React.PointerEvent,
  camera: Camera,
): Point => {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  };
};

// Функция для преобразование массива точек, нарисованных карандашом, в объект слоя, который можно добавить на холст
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
    stroke: color,
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
