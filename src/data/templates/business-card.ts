/**
 * Модуль шаблона визитной карточки
 *
 * Содержит готовый шаблон для создания классической визитной карточки
 * с определенной структурой слоев, включая рамку, цветную боковую панель
 * и текстовые элементы для контактной информации.
 */

import { Template, TemplateCategory } from "~/types";
import { LayerType } from "~/types";

/**
 * Шаблон визитной карточки с синей боковой панелью
 * Включает фрейм 300×180, прямоугольник и три текстовых блока для информации
 */
const businessCardTemplate: Template = {
  id: "business-card-1",
  name: "Визитная карточка 1",
  category: TemplateCategory.BusinessCard,
  thumbnail: "/templates/business-card-1.jpg",
  rootLayerIds: ["frame1"],
  layers: {
    // Основной фрейм (холст) визитки
    frame1: {
      type: LayerType.Frame,
      x: 100,
      y: 100,
      width: 300,
      height: 180,
      fill: { r: 255, g: 255, b: 255 },
      stroke: { r: 230, g: 230, b: 230 },
      opacity: 1,
      cornerRadius: 8,
      strokeWidth: 1,
      childIds: ["rect1", "text1", "text2", "text3"],
    },
    // Синяя боковая панель
    rect1: {
      type: LayerType.Rectangle,
      x: 0,
      y: 0,
      width: 100,
      height: 180,
      fill: { r: 35, g: 107, b: 254 },
      stroke: null,
      opacity: 1,
      cornerRadius: 0,
    },
    // Имя и фамилия
    text1: {
      type: LayerType.Text,
      x: 120,
      y: 40,
      width: 160,
      height: 30,
      text: "Иван Иванов",
      fontSize: 18,
      fontWeight: 700,
      fontFamily: "Inter",
      lineHeight: 1.2,
      letterSpacing: 0,
      fill: { r: 33, g: 33, b: 33 },
      stroke: null,
      opacity: 1,
      isFixedSize: false,
    },
    // Должность
    text2: {
      type: LayerType.Text,
      x: 120,
      y: 75,
      width: 160,
      height: 25,
      text: "Дизайнер",
      fontSize: 14,
      fontWeight: 500,
      fontFamily: "Inter",
      lineHeight: 1.2,
      letterSpacing: 0,
      fill: { r: 102, g: 102, b: 102 },
      stroke: null,
      opacity: 1,
      isFixedSize: false,
    },
    // Номер телефона
    text3: {
      type: LayerType.Text,
      x: 120,
      y: 125,
      width: 160,
      height: 20,
      text: "+7 (900) 123-45-67",
      fontSize: 12,
      fontWeight: 400,
      fontFamily: "Inter",
      lineHeight: 1.2,
      letterSpacing: 0,
      fill: { r: 102, g: 102, b: 102 },
      stroke: null,
      opacity: 1,
      isFixedSize: false,
    },
  },
};

export default businessCardTemplate;
