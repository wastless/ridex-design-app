/**
 * Утилиты для работы с палитрой цветов
 * Содержит функции для генерации различных типов цветовых палитр,
 * экспорта и преобразования палитры
 */
import type { PaletteColor } from "../types";
import { PaletteGenerationMethod } from "../types";
import {
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  generateRandomColor,
  isDarkColor,
} from "./color-utils";

/**
 * Генерирует монохромную палитру на основе базового цвета
 *
 * @param baseColor Базовый цвет в формате HEX
 * @returns Массив цветов монохромной палитры
 */
export function generateMonochromaticPalette(baseColor: string): string[] {
  try {
    // Проверяем формат hex-кода
    if (!/^#([0-9A-F]{3}){1,2}$/i.exec(baseColor)) {
      baseColor = "#000000";
    }

    const rgb = baseColor.substring(1);
    const r = parseInt(rgb.substring(0, 2), 16);
    const g = parseInt(rgb.substring(2, 4), 16);
    const b = parseInt(rgb.substring(4, 6), 16);

    const [h, s, l] = rgbToHsl(r, g, b);

    return [
      rgbToHex(...hslToRgb(h, s, Math.max(10, l - 40))),
      rgbToHex(...hslToRgb(h, s, Math.max(10, l - 20))),
      baseColor,
      rgbToHex(...hslToRgb(h, s, Math.min(90, l + 20))),
      rgbToHex(...hslToRgb(h, s, Math.min(90, l + 40))),
      rgbToHex(...hslToRgb(h, Math.max(10, s - 20), l)),
    ];
  } catch (error) {
    console.error("Error generating monochromatic palette:", error);
    // Возвращаем безопасную палитру по умолчанию при ошибке
    return ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF"];
  }
}

/**
 * Генерирует аналоговую палитру на основе базового цвета
 *
 * @param baseColor Базовый цвет в формате HEX
 * @returns Массив цветов аналоговой палитры
 */
export function generateAnalogousPalette(baseColor: string): string[] {
  try {
    // Проверяем формат hex-кода
    if (!/^#([0-9A-F]{3}){1,2}$/i.exec(baseColor)) {
      baseColor = "#000000";
    }

    const rgb = baseColor.substring(1);
    const r = parseInt(rgb.substring(0, 2), 16);
    const g = parseInt(rgb.substring(2, 4), 16);
    const b = parseInt(rgb.substring(4, 6), 16);

    const [h, s, l] = rgbToHsl(r, g, b);

    return [
      rgbToHex(...hslToRgb((h - 60 + 360) % 360, s, l)),
      rgbToHex(...hslToRgb((h - 30 + 360) % 360, s, l)),
      baseColor,
      rgbToHex(...hslToRgb((h + 30) % 360, s, l)),
      rgbToHex(...hslToRgb((h + 60) % 360, s, l)),
      rgbToHex(...hslToRgb((h + 90) % 360, s, l)),
    ];
  } catch (error) {
    console.error("Error generating analogous palette:", error);
    return ["#0000FF", "#3333FF", "#6666FF", "#9999FF", "#CCCCFF", "#FFFFFF"];
  }
}

/**
 * Генерирует комплементарную палитру на основе базового цвета
 *
 * @param baseColor Базовый цвет в формате HEX
 * @returns Массив цветов комплементарной палитры
 */
export function generateComplementaryPalette(baseColor: string): string[] {
  try {
    // Проверяем формат hex-кода
    if (!/^#([0-9A-F]{3}){1,2}$/i.exec(baseColor)) {
      baseColor = "#000000";
    }

    const rgb = baseColor.substring(1);
    const r = parseInt(rgb.substring(0, 2), 16);
    const g = parseInt(rgb.substring(2, 4), 16);
    const b = parseInt(rgb.substring(4, 6), 16);

    const [h, s, l] = rgbToHsl(r, g, b);
    const complementaryHue = (h + 180) % 360;

    return [
      rgbToHex(...hslToRgb(h, Math.max(10, s - 20), Math.max(10, l - 20))),
      rgbToHex(...hslToRgb(h, s, l)),
      rgbToHex(...hslToRgb(h, Math.min(100, s + 20), Math.min(90, l + 20))),
      rgbToHex(
        ...hslToRgb(
          complementaryHue,
          Math.max(10, s - 20),
          Math.max(10, l - 20),
        ),
      ),
      rgbToHex(...hslToRgb(complementaryHue, s, l)),
      rgbToHex(
        ...hslToRgb(
          complementaryHue,
          Math.min(100, s + 20),
          Math.min(90, l + 20),
        ),
      ),
    ];
  } catch (error) {
    console.error("Error generating complementary palette:", error);
    return ["#FF0000", "#FF3333", "#FF6666", "#00FFFF", "#33FFFF", "#66FFFF"];
  }
}

/**
 * Генерирует сплит-комплементарную палитру на основе базового цвета
 *
 * @param baseColor Базовый цвет в формате HEX
 * @returns Массив цветов сплит-комплементарной палитры
 */
export function generateSplitComplementaryPalette(baseColor: string): string[] {
  try {
    // Проверяем формат hex-кода
    if (!/^#([0-9A-F]{3}){1,2}$/i.exec(baseColor)) {
      baseColor = "#000000";
    }

    const rgb = baseColor.substring(1);
    const r = parseInt(rgb.substring(0, 2), 16);
    const g = parseInt(rgb.substring(2, 4), 16);
    const b = parseInt(rgb.substring(4, 6), 16);

    const [h, s, l] = rgbToHsl(r, g, b);
    const complementaryHue1 = (h + 150) % 360;
    const complementaryHue2 = (h + 210) % 360;

    return [
      baseColor,
      rgbToHex(...hslToRgb(h, Math.min(100, s + 10), Math.min(90, l + 10))),
      rgbToHex(...hslToRgb(h, Math.max(10, s - 10), Math.max(10, l - 10))),
      rgbToHex(...hslToRgb(complementaryHue1, s, l)),
      rgbToHex(...hslToRgb(complementaryHue2, s, l)),
      rgbToHex(...hslToRgb((h + 60) % 360, s, l)),
    ];
  } catch (error) {
    console.error("Error generating split complementary palette:", error);
    return ["#FF0000", "#FF5500", "#FFAA00", "#00AAFF", "#0055FF", "#FF00AA"];
  }
}

/**
 * Генерирует триадную палитру на основе базового цвета
 *
 * @param baseColor Базовый цвет в формате HEX
 * @returns Массив цветов триадной палитры
 */
export function generateTriadicPalette(baseColor: string): string[] {
  try {
    // Проверяем формат hex-кода
    if (!/^#([0-9A-F]{3}){1,2}$/i.exec(baseColor)) {
      baseColor = "#000000";
    }

    const rgb = baseColor.substring(1);
    const r = parseInt(rgb.substring(0, 2), 16);
    const g = parseInt(rgb.substring(2, 4), 16);
    const b = parseInt(rgb.substring(4, 6), 16);

    const [h, s, l] = rgbToHsl(r, g, b);
    const triadicHue1 = (h + 120) % 360;
    const triadicHue2 = (h + 240) % 360;

    return [
      baseColor,
      rgbToHex(...hslToRgb(h, Math.min(100, s + 10), Math.min(90, l + 10))),
      rgbToHex(...hslToRgb(triadicHue1, s, l)),
      rgbToHex(
        ...hslToRgb(triadicHue1, Math.min(100, s + 10), Math.min(90, l + 10)),
      ),
      rgbToHex(...hslToRgb(triadicHue2, s, l)),
      rgbToHex(
        ...hslToRgb(triadicHue2, Math.min(100, s + 10), Math.min(90, l + 10)),
      ),
    ];
  } catch (error) {
    console.error("Error generating triadic palette:", error);
    return ["#FF0000", "#FF5555", "#00FF00", "#55FF55", "#0000FF", "#5555FF"];
  }
}

/**
 * Генерирует тетрадную палитру на основе базового цвета
 *
 * @param baseColor Базовый цвет в формате HEX
 * @returns Массив цветов тетрадной палитры
 */
export function generateTetradicPalette(baseColor: string): string[] {
  try {
    // Проверяем формат hex-кода
    if (!/^#([0-9A-F]{3}){1,2}$/i.exec(baseColor)) {
      baseColor = "#000000";
    }

    const rgb = baseColor.substring(1);
    const r = parseInt(rgb.substring(0, 2), 16);
    const g = parseInt(rgb.substring(2, 4), 16);
    const b = parseInt(rgb.substring(4, 6), 16);

    const [h, s, l] = rgbToHsl(r, g, b);
    const tetradicHue1 = (h + 90) % 360;
    const tetradicHue2 = (h + 180) % 360;
    const tetradicHue3 = (h + 270) % 360;

    return [
      baseColor,
      rgbToHex(...hslToRgb(tetradicHue1, s, l)),
      rgbToHex(...hslToRgb(tetradicHue2, s, l)),
      rgbToHex(...hslToRgb(tetradicHue3, s, l)),
      rgbToHex(...hslToRgb(h, Math.max(10, s - 20), Math.min(90, l + 20))),
      rgbToHex(
        ...hslToRgb(tetradicHue2, Math.max(10, s - 20), Math.min(90, l + 20)),
      ),
    ];
  } catch (error) {
    console.error("Error generating tetradic palette:", error);
    return ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
  }
}

/**
 * Генерирует автоматическую палитру (случайный метод)
 *
 * @param baseColor Базовый цвет в формате HEX
 * @returns Массив цветов сгенерированной палитры
 */
export function generateAutoPalette(baseColor: string): string[] {
  try {
    // Проверяем формат hex-кода
    if (!/^#([0-9A-F]{3}){1,2}$/i.exec(baseColor)) {
      baseColor = "#000000";
    }

    const methods = [
      generateMonochromaticPalette,
      generateAnalogousPalette,
      generateComplementaryPalette,
      generateSplitComplementaryPalette,
      generateTriadicPalette,
      generateTetradicPalette,
    ];

    const randomIndex = Math.floor(Math.random() * methods.length);
    const randomMethod = methods[randomIndex];
    if (!randomMethod) {
      return generateMonochromaticPalette(baseColor); // Fallback
    }
    return randomMethod(baseColor);
  } catch (error) {
    console.error("Error generating auto palette:", error);
    return ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
  }
}

/**
 * Создает новую палитру с учетом закрепленных цветов
 *
 * @param currentPalette Текущая палитра
 * @param method Метод генерации новой палитры
 * @returns Обновленная палитра
 */
export function generatePaletteWithMethod(
  currentPalette: PaletteColor[],
  method: PaletteGenerationMethod,
): PaletteColor[] {
  // Создаем копию исходной палитры для безопасного обновления
  const safePalette = [...currentPalette];

  try {
    // Находим все закрепленные цвета
    const lockedColors = safePalette.filter(
      (color) => color.locked && color.hex,
    );

    // Если есть закрепленные цвета, используем первый из них как базовый
    // Иначе генерируем новый случайный цвет чтобы избежать постепенного затемнения
    let baseColor: string;

    if (lockedColors.length > 0 && lockedColors[0]?.hex) {
      // Используем первый закрепленный цвет как базу
      baseColor = lockedColors[0].hex;
    } else {
      // Если нет закрепленных цветов, генерируем свежий случайный цвет
      baseColor = generateRandomColor();
    }

    // Проверяем формат hex-кода
    if (!/^#([0-9A-F]{3}){1,2}$/i.exec(baseColor)) {
      baseColor = generateRandomColor();
    }

    let newColors: string[] = [];

    // Генерируем новую палитру в зависимости от выбранного метода
    switch (method) {
      case PaletteGenerationMethod.Auto:
        newColors = generateAutoPalette(baseColor);
        break;
      case PaletteGenerationMethod.Monochromatic:
        newColors = generateMonochromaticPalette(baseColor);
        break;
      case PaletteGenerationMethod.Analogous:
        newColors = generateAnalogousPalette(baseColor);
        break;
      case PaletteGenerationMethod.Complementary:
        newColors = generateComplementaryPalette(baseColor);
        break;
      case PaletteGenerationMethod.SplitComplementary:
        newColors = generateSplitComplementaryPalette(baseColor);
        break;
      case PaletteGenerationMethod.Triadic:
        newColors = generateTriadicPalette(baseColor);
        break;
      case PaletteGenerationMethod.Tetradic:
        newColors = generateTetradicPalette(baseColor);
        break;
      default:
        newColors = generateAutoPalette(baseColor);
    }

    // Проверяем, что у нас достаточно цветов в палитре
    while (newColors.length < safePalette.length) {
      newColors.push(generateRandomColor());
    }

    // Сохраняем закрепленные цвета и обновляем незакрепленные
    return safePalette.map((color, index) => {
      if (color.locked && color.hex) {
        return {
          hex: color.hex,
          locked: true,
        };
      }
      return {
        hex: newColors[index] ?? "#000000", // Гарантируем значение по умолчанию
        locked: false,
      };
    });
  } catch (error) {
    console.error("Error generating palette with method:", error);

    // В случае ошибки создаем безопасную палитру с базовыми цветами
    const defaultColors = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
    ];

    // Если исходная палитра пуста, создаем новую с дефолтными цветами
    if (safePalette.length === 0) {
      return defaultColors.map((hex) => ({
        hex,
        locked: false,
      })) as PaletteColor[];
    }

    // Иначе обновляем текущую палитру, сохраняя заблокированные цвета
    return safePalette.map((color, index) => {
      const colorIndex = index % defaultColors.length;
      if (color.locked && color.hex) {
        return { hex: color.hex, locked: true };
      }
      return { hex: defaultColors[colorIndex], locked: false };
    }) as PaletteColor[];
  }
}

/**
 * Экспортирует палитру в изображение
 *
 * @param palette Палитра для экспорта
 */
export function exportPaletteAsImage(palette: PaletteColor[]): void {
  const canvas = document.createElement("canvas");
  canvas.width = 600; // 6 квадратов по 100px
  canvas.height = 100;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  palette.forEach((color, index) => {
    // Рисуем квадрат
    ctx.fillStyle = color.hex;
    ctx.fillRect(index * 100, 0, 100, 100);

    // Добавляем hex-код
    ctx.fillStyle = isDarkColor(color.hex) ? "#FFFFFF" : "#000000";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(color.hex, index * 100 + 50, 50);
  });

  // Конвертируем canvas в изображение и скачиваем
  const link = document.createElement("a");
  link.download = "palette.png";
  const dataUrl = canvas.toDataURL("image/png");
  if (dataUrl) {
    link.href = dataUrl;
    link.click();
  }
}
