"use client";

/**
 * Функциональность для создания различных типов слоев на холсте
 * Предоставляет единый интерфейс для создания всех поддерживаемых типов слоев с необходимыми свойствами
 */

import { LiveObject } from "@liveblocks/client";
import {
  LayerType,
  type EllipseLayer,
  type RectangleLayer,
  type TextLayer,
  type TriangleLayer,
  type FrameLayer,
  type ImageLayer,
} from "~/types";

// Константы для текстовых слоев
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_LINE_HEIGHT_COEFFICIENT = 1.2;

/**
 * Создает новый слой заданного типа с указанными параметрами
 * @param layerType - Тип создаваемого слоя
 * @param x - X-координата слоя
 * @param y - Y-координата слоя
 * @param width - Ширина слоя
 * @param height - Высота слоя
 * @param textContent - Текстовое содержимое (для текстовых слоев)
 * @param isFixedSize - Флаг фиксированного размера (для текстовых слоев)
 * @param imageUrl - URL изображения (для слоев с изображениями)
 * @param aspectRatio - Соотношение сторон (для слоев с изображениями)
 * @returns LiveObject слоя или null, если тип не поддерживается
 */
export function createLayer(
  layerType: LayerType,
  x: number,
  y: number,
  width: number,
  height: number,
  textContent?: string,
  isFixedSize = false,
  imageUrl?: string,
  aspectRatio?: number,
) {
  // Базовые свойства, общие для всех типов слоев
  const baseProps = {
    x,
    y,
    width,
    height,
    opacity: 100,
    blendMode: "normal",
  };

  if (layerType === LayerType.Rectangle) {
    // Создание прямоугольника
    return new LiveObject<RectangleLayer>({
      type: LayerType.Rectangle,
      ...baseProps,
      fill: { r: 217, g: 217, b: 217 }, // Светло-серый цвет по умолчанию
      stroke: null, // Без обводки по умолчанию
    });
  } else if (layerType === LayerType.Ellipse) {
    // Создание эллипса
    return new LiveObject<EllipseLayer>({
      type: LayerType.Ellipse,
      ...baseProps,
      fill: { r: 217, g: 217, b: 217 },
      stroke: null,
    });
  } else if (layerType === LayerType.Triangle) {
    // Создание треугольника
    return new LiveObject<TriangleLayer>({
      type: LayerType.Triangle,
      ...baseProps,
      fill: { r: 217, g: 217, b: 217 },
      stroke: null,
    });
  } else if (layerType === LayerType.Text) {
    // Создание текстового блока
    return new LiveObject<TextLayer>({
      type: LayerType.Text,
      ...baseProps,
      text: textContent ?? "", // Текст по умолчанию - пустая строка
      fontSize: DEFAULT_FONT_SIZE,
      fontWeight: 400,
      fontFamily: "Inter",
      lineHeight: DEFAULT_LINE_HEIGHT_COEFFICIENT,
      letterSpacing: 0,
      stroke: null,
      fill: { r: 0, g: 0, b: 0 }, // Черный цвет текста по умолчанию
      isFixedSize,
    });
  } else if (layerType === LayerType.Frame) {
    // Создание рамки (контейнера)
    return new LiveObject<FrameLayer>({
      type: LayerType.Frame,
      ...baseProps,
      fill: { r: 255, g: 255, b: 255 }, // Белый фон по умолчанию
      stroke: null,
      strokeWidth: 1,
      cornerRadius: 0,
      childIds: [], // Пустой массив дочерних элементов
    });
  } else if (layerType === LayerType.Image && imageUrl && aspectRatio) {
    // Создание слоя с изображением
    return new LiveObject<ImageLayer>({
      type: LayerType.Image,
      ...baseProps,
      url: imageUrl,
      aspectRatio: aspectRatio,
    });
  }

  // Для неподдерживаемых типов возвращаем null
  return null;
}
