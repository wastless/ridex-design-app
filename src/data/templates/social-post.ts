/**
 * Модуль шаблона поста для социальных сетей
 *
 * Содержит готовый шаблон для создания публикации в Instagram
 * с определенной структурой слоев, включая рамку, фигуры и текстовые элементы.
 * Шаблон имеет оранжевую цветовую схему на светлом фоне.
 */

import { Template, TemplateCategory } from "~/types";
import { LayerType } from "~/types";

/**
 * Шаблон поста для Instagram с оранжевыми акцентами
 * Включает фрейм 500×500, эллипс, прямоугольник и два текстовых блока
 */
const socialPostTemplate: Template = {
  id: "social-post-1",
  name: "Пост для Instagram",
  category: TemplateCategory.SocialMedia,
  thumbnail: "/templates/social-post-1.jpg",
  rootLayerIds: ["frame1"],
  layers: {
    // Основной фрейм (холст) шаблона
    frame1: {
      type: LayerType.Frame,
      x: 100,
      y: 100,
      width: 500,
      height: 500,
      fill: { r: 252, g: 241, b: 230 },
      stroke: null,
      opacity: 100,
      cornerRadius: 0,
      childIds: ["rect1", "ellipse1", "text1", "text2"],
    },
    // Прямоугольник в нижней части шаблона
    rect1: {
      type: LayerType.Rectangle,
      x: 0,
      y: 350,
      width: 500,
      height: 150,
      fill: { r: 255, g: 165, b: 0 },
      stroke: null,
      opacity: 80,
      cornerRadius: 0,
    },
    // Круг в центре шаблона
    ellipse1: {
      type: LayerType.Ellipse,
      x: 250,
      y: 175,
      width: 250,
      height: 250,
      fill: { r: 255, g: 165, b: 0 },
      stroke: { r: 255, g: 255, b: 255 },
      strokeWidth: 8,
      opacity: 100,
    },
    // Заголовок
    text1: {
      type: LayerType.Text,
      x: 100,
      y: 400,
      width: 300,
      height: 50,
      text: "ЛЕТНЯЯ КОЛЛЕКЦИЯ",
      fontSize: 24,
      fontWeight: 700,
      fontFamily: "Inter",
      lineHeight: 1.2,
      letterSpacing: 1,
      fill: { r: 255, g: 255, b: 255 },
      stroke: null,
      opacity: 100,
      isFixedSize: false,
    },
    // Подзаголовок
    text2: {
      type: LayerType.Text,
      x: 100,
      y: 450,
      width: 300,
      height: 40,
      text: "Скидки до 30%",
      fontSize: 18,
      fontWeight: 400,
      fontFamily: "Inter",
      lineHeight: 1.2,
      letterSpacing: 0,
      fill: { r: 255, g: 255, b: 255 },
      stroke: null,
      opacity: 100,
      isFixedSize: false,
    },
  },
};

export default socialPostTemplate;
