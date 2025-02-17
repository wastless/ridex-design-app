/*** Рендеринг кнопки с выпадающем списком фигур в панели инструментов ***/
"use client";

import * as React from "react";
import * as Dropdown from "~/components/ui/dropdown";
import * as Kbd from "~/components/ui/kbd";
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react";
import { cnExt } from "utils/cn";
import {CanvasMode, LayerType} from "~/types";
import { tv } from "utils/tv";
import {ellipse, rectangle} from "~/icon";

const toolbarDropdownVariants = tv({
  slots: {
    container: [
      // базовый контейнер выпадающего списка
      "flex items-center justify-center",
      "relative flex shrink-0 items-center justify-center outline-none m-0 rounded-md",
      "transition duration-200 ease-out",
      // при наведении
      "hover:bg-bg-weak-50",
      // фокус
      'focus:outline-none',
    ],
    iconButton: [
      // базовый стиль иконок
      "flex items-center justify-center",
      "h-6 w-auto min-w-0 m-1 shrink-0 object-contain cursor-pointer",
    ],
    arrowButton: [
      // базовый стиль стрелки
      "size-4 shrink-0 cursor-pointer",
      "transition duration-200 ease-out transform ",
        // при наведении
      "hover:translate-y-[2px]",
        // фокус
      'focus:outline-none',
    ],
    // базовый стиль иконок в выпадающем списке
    selectItemIcon: ["size-5 shrink-0 bg-[length:1.25rem] text-text-sub-600"],
    // базовый стиль галочки в выпадающем списке
    selectItemCheckIcon: ["h-4 w-4 shrink-0 text-text-sub-600 mr-2"],
    // базовый стиль названия списка
    selectItemLabel: ["flex-1"],
    // базовый стиль горячей клавиши
    selectItemKbd: ["ml-auto "],
  },
});

// Определение типов пропсов для компонента
type ToolbarDropdownShapeProps = {
  items: {
    icon: React.ElementType;
    value: LayerType;
    label: string;
    kbd: string;
  }[];
  defaultValue: LayerType;
  onSelectAction: (value: LayerType) => void;
  isActiveAction: (value: LayerType) => boolean;
};

// Определение компонента для выпадающего списка
export function ToolbarDropdownShape({
                                       canvasState,
                                       onSelectAction,
                                       isActiveAction,
                                     }: {
  canvasState: { mode: CanvasMode; layerType?: LayerType };
  onSelectAction: (value: LayerType) => void;
  isActiveAction: (value: LayerType) => boolean;
}) {
  const shapes = [
    {
      icon: rectangle,
      value: LayerType.Rectangle,
      label: "Прямоугольник",
      kbd: "R",
    },
    {
      icon: ellipse,
      value: LayerType.Ellipse,
      label: "Эллипс",
      kbd: "O",
    },
  ];

  // Проверяем, есть ли текущий layerType в списке фигур
  const isValidLayer = shapes.some((shape) => shape.value === canvasState.layerType);

  // Состояние для отображаемого значения
  const [selectedValue, setSelectedValue] = React.useState<LayerType>(
      isValidLayer ? canvasState.layerType! : LayerType.Rectangle
  );

  // Следим за изменением canvasState.layerType
  React.useEffect(() => {
    if (isValidLayer) {
      console.log("Обновляем selectedValue:", canvasState.layerType);
      setSelectedValue(canvasState.layerType!);
    }
  }, [canvasState.layerType, isValidLayer]);

  const {
    container,
    iconButton,
    arrowButton,
    selectItemIcon,
    selectItemCheckIcon,
    selectItemLabel,
    selectItemKbd,
  } = toolbarDropdownVariants();

  const [isOpen, setIsOpen] = React.useState(false);

  return (
      <Dropdown.Root onOpenChange={(open) => setIsOpen(open)}>
        <div
            className={cnExt(
                container(),
                (isActiveAction(selectedValue) || isOpen) && "bg-bg-weak-50",
            )}
        >
          <button
              className={cnExt(
                  iconButton(),
                  isActiveAction(selectedValue)
                      ? "text-primary-base"
                      : "text-text-sub-600",
              )}
              onClick={() => onSelectAction(selectedValue)}
          >
            {/* Рендерим только если layerType есть в shapes */}
            {shapes.find((shape) => shape.value === selectedValue)?.icon ? (
                React.createElement(
                    shapes.find((shape) => shape.value === selectedValue)!.icon
                )
            ) : (
                <span className="opacity-50">?</span> // Заглушка, если инструмент не найден
            )}
          </button>

          <Dropdown.Trigger asChild>
            <button
                className={cnExt(
                    arrowButton(),
                    isOpen ? "rotate-180" : "",
                    isActiveAction(selectedValue)
                        ? "text-primary-base"
                        : "text-text-sub-600",
                )}
            >
              <RiArrowDownSLine className="h-4 w-4" />
            </button>
          </Dropdown.Trigger>
        </div>

        <Dropdown.Content className="w-60">
          {shapes.map((shape) => (
              <Dropdown.Item
                  key={shape.value}
                  onSelect={() => onSelectAction(shape.value)}
                  className="flex cursor-pointer items-center rounded-md"
              >
                <div className="flex w-4 items-center justify-center">
                  {selectedValue === shape.value && (
                      <RiCheckLine className={cnExt(selectItemCheckIcon())} />
                  )}
                </div>
                <shape.icon className={cnExt(selectItemIcon())} />
                <span className={cnExt(selectItemLabel())}>{shape.label}</span>
                <Kbd.Root className={cnExt(selectItemKbd())}>{shape.kbd}</Kbd.Root>
              </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Root>
  );
}
