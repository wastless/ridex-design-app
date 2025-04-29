/**
 * Утилиты для проверки доступности
 * Содержит функции для расчета и оценки контраста между цветами
 * по стандарту APCA (Advanced Perceptual Contrast Algorithm) для WCAG 3.0
 */

/**
 * Реализация алгоритма APCA (Advanced Perceptual Contrast Algorithm) для проверки контраста по WCAG 3.0
 *
 * @param textColorHex - Цвет текста в формате hex
 * @param backgroundColorHex - Цвет фона в формате hex
 * @returns Значение контраста в диапазоне от -108 до 106 (абсолютное значение > 60 считается хорошим)
 */
export function calculateAPCAContrast(
  textColorHex: string,
  backgroundColorHex: string,
): number {
  // Функция для преобразования hex в RGB
  const hexToRGBValues = (hex: string): [number, number, number] => {
    // Удаляем # если он есть
    const cleanHex = hex.replace("#", "");

    // Получаем RGB значения
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return [r, g, b];
  };

  // Функция для преобразования sRGB в линейный RGB
  const sRGBtoLinear = (val: number): number => {
    const v = val / 255;
    if (v <= 0.04045) {
      return v / 12.92;
    }
    return ((v + 0.055) / 1.055) ** 2.4;
  };

  // Получаем RGB значения для текста и фона
  const [textR, textG, textB] = hexToRGBValues(textColorHex);
  const [bgR, bgG, bgB] = hexToRGBValues(backgroundColorHex);

  // Преобразуем в линейный RGB
  const linearTextR = sRGBtoLinear(textR);
  const linearTextG = sRGBtoLinear(textG);
  const linearTextB = sRGBtoLinear(textB);

  const linearBgR = sRGBtoLinear(bgR);
  const linearBgG = sRGBtoLinear(bgG);
  const linearBgB = sRGBtoLinear(bgB);

  // Вычисляем яркость (Y)
  const textY =
    0.2126 * linearTextR + 0.7152 * linearTextG + 0.0722 * linearTextB;
  const bgY = 0.2126 * linearBgR + 0.7152 * linearBgG + 0.0722 * linearBgB;

  // Определяем полярность (текст темнее или светлее фона)
  const polarity = bgY > textY ? 1 : -1;

  // Коэффициенты APCA
  const SAPC_Y_LIGHT = 1.14;
  const SAPC_Y_DARK = 0.56;
  const SAPC_OFFSET_LIGHT = 0.027;
  const SAPC_OFFSET_DARK = 0.027;

  // Вычисляем контраст по формуле APCA
  let contrast: number;

  if (polarity === 1) {
    // Текст темнее фона
    contrast = bgY ** SAPC_Y_LIGHT - textY ** SAPC_Y_DARK;
    contrast =
      contrast < SAPC_OFFSET_LIGHT ? 0 : (contrast - SAPC_OFFSET_LIGHT) * 100;
  } else {
    // Текст светлее фона
    contrast = bgY ** SAPC_Y_DARK - textY ** SAPC_Y_LIGHT;
    contrast =
      contrast < SAPC_OFFSET_DARK ? 0 : (contrast - SAPC_OFFSET_DARK) * -100;
  }

  return Math.round(contrast * 100) / 100;
}

/**
 * Оценивает контраст по APCA и возвращает текстовое описание уровня доступности
 *
 * @param contrast - Значение контраста, полученное из calculateAPCAContrast
 * @returns Объект с оценкой контрастности, описанием и цветом для отображения
 */
export function evaluateAPCAContrast(contrast: number): {
  level: string;
  description: string;
  color: string;
} {
  const absContrast = Math.abs(contrast);

  if (absContrast >= 90) {
    return {
      level: "AAA+",
      description: "Отлично! Подходит для мелкого текста",
      color: "#1FC16B", // зеленый
    };
  } else if (absContrast >= 75) {
    return {
      level: "AAA",
      description: "Очень хорошо. Подходит для основного текста",
      color: "#1FC16B", // зеленый
    };
  } else if (absContrast >= 60) {
    return {
      level: "AA",
      description: "Хорошо. Подходит для больших текстов",
      color: "#84cc16", // желто-зеленый
    };
  } else if (absContrast >= 45) {
    return {
      level: "A",
      description: "Удовлетворительно. Для крупных заголовков",
      color: "#F6B51E", // желтый
    };
  } else if (absContrast >= 30) {
    return {
      level: "Низкий",
      description: "Только для декоративных элементов",
      color: "#f97316", // оранжевый
    };
  } else {
    return {
      level: "Плохой",
      description: "Недостаточный контраст",
      color: "#FB3748", // красный
    };
  }
}
