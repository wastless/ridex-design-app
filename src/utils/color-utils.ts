/**
 * Утилиты для работы с цветами
 * Содержит функции для преобразования цветов между различными форматами (HEX, RGB, HSL)
 * и вспомогательные функции для работы с цветами
 */
import type { Color } from "../types";

/**
 * Преобразует цвет в формат CSS (hex)
 * @param color - Объект цвета или null/undefined
 * @returns Строка с цветом в формате HEX
 */
export function colorToCss(color: Color | null | undefined): string {
  if (!color) return "#CCC";

  const r = color.r?.toString(16).padStart(2, "0") || "00";
  const g = color.g?.toString(16).padStart(2, "0") || "00";
  const b = color.b?.toString(16).padStart(2, "0") || "00";
  const a =
    color.a !== undefined ? color.a.toString(16).padStart(2, "0") : "ff";

  return `#${r}${g}${b}${a}`;
}

/**
 * Преобразует HEX в RGB объект
 * @param hex - Цвет в формате HEX
 * @returns Объект цвета в формате RGB
 */
export function hexToRgb(hex: string): Color {
  // Удаляем # если присутствует
  const cleanHex = hex.replace("#", "");

  // Проверяем, включает ли hex альфа-канал (8 цифр)
  if (cleanHex.length >= 8) {
    // Парсим hex значения в компоненты r,g,b,a
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const a = parseInt(cleanHex.substring(6, 8), 16);

    return { r, g, b, a };
  } else {
    // Парсим hex значения в компоненты r,g,b (без альфа)
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return { r, g, b };
  }
}

/**
 * Преобразует HSL в RGB
 * @param h - Оттенок (0-360)
 * @param s - Насыщенность (0-100)
 * @param l - Светлота (0-100)
 * @returns Массив RGB значений [r, g, b]
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ];
}

/**
 * Преобразует RGB в HSL
 * @param r - Красный компонент (0-255)
 * @param g - Зеленый компонент (0-255)
 * @param b - Синий компонент (0-255)
 * @returns Массив HSL значений [h, s, l]
 */
export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h *= 60;
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Преобразует RGB в HEX
 * @param r - Красный компонент (0-255)
 * @param g - Зеленый компонент (0-255)
 * @param b - Синий компонент (0-255)
 * @returns Строка с цветом в формате HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  // Проверяем диапазон значений RGB
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
}

/**
 * Генерирует случайный цвет в формате HEX
 * @returns Строка с случайным цветом в формате HEX
 */
export function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex(r, g, b);
}

/**
 * Проверяет, является ли цвет темным
 * @param hex - Цвет в формате HEX
 * @returns true если цвет тёмный, false если светлый
 */
export function isDarkColor(hex: string): boolean {
  const rgb = hex.substring(1);
  const r = parseInt(rgb.substring(0, 2), 16);
  const g = parseInt(rgb.substring(2, 4), 16);
  const b = parseInt(rgb.substring(4, 6), 16);

  // Формула для определения яркости
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

/**
 * Возвращает цвет из набора цветов по ID соединения
 * @param connectionId - ID соединения
 * @returns Строка с цветом в формате HEX
 */
export function connectionIdToColor(connectionId: number): string {
  const COLORS = [
    "#3B82F6", // синий
    "#F59E0B", // жёлтый
    "#8B5CF6", // фиолетовый
    "#EC4899", // красный
    "#6366F1", // небесный
  ];

  return COLORS[connectionId % COLORS.length]!;
}
