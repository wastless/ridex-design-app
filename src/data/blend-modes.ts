/**
 * Модуль режимов наложения (blend modes)
 *
 * Содержит список доступных режимов наложения для использования
 * в графическом редакторе при работе со слоями
 *
 * Каждый режим наложения имеет:
 * - value: внутреннее значение на английском языке для использования в CSS
 * - label: отображаемое название на русском языке
 */

export const blendModes = [
  {
    value: "normal",
    label: "Нормальный",
  },
  {
    value: "darken",
    label: "Затемнение",
  },
  {
    value: "plus_darken",
    label: "Темнее",
  },
  {
    value: "multiply",
    label: "Умножение",
  },
  {
    value: "color_burn",
    label: "Затемнение основы",
  },
  {
    value: "lighten",
    label: "Яркость",
  },
  {
    value: "plus_lighten",
    label: "Светлее",
  },
  {
    value: "screen",
    label: "Цветной фильтр",
  },
  {
    value: "color_dodge",
    label: "Осветление цвета",
  },
  {
    value: "overlay",
    label: "Наложение",
  },
  {
    value: "soft_light",
    label: "Мягкий свет",
  },
  {
    value: "hard_light",
    label: "Жесткий свет",
  },
  {
    value: "difference",
    label: "Отличие",
  },
  {
    value: "exclusion",
    label: "Исключение",
  },
  {
    value: "hue",
    label: "Оттенок",
  },
  {
    value: "saturation",
    label: "Насыщенность",
  },
  {
    value: "color",
    label: "Цвет",
  },
  {
    value: "luminosity",
    label: "Яркость",
  },
];
