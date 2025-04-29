/*** Рендеринг кнопки с выпадающем списком инструментов перемещения в панели инструментов ***/
"use client";

import * as React from "react";
import * as Dropdown from "~/components/ui/dropdown";
import * as Kbd from "~/components/ui/kbd";
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react";
import { cnExt } from "~/utils/cn";
import { CanvasMode } from "~/types";
import { tv } from "~/utils/tv";
import {cursor, hand} from "~/icon";

const toolbarDropdownVariants = tv({
  slots: {
    container: [
      // базовый контейнер выпадающего списка
      "flex items-center justify-center",
      "relative flex shrink-0 items-center justify-center outline-none m-0 rounded-md",
      "transition duration-200 ease-in-out",
      // при наведении
      "hover:bg-bg-weak-50",
      // фокус
      "focus:outline-none",
    ],
    iconButton: [
      // базовый стиль иконок
      "flex items-center justify-center",
      "h-6 w-auto min-w-0 m-1 shrink-0 object-contain cursor-pointer",
    ],
    arrowButton: [
      // базовый стиль стрелки
      "size-4 shrink-0 cursor-pointer",
      "transition duration-200 ease-out transform transition-transform",
      // при наведении
      "hover:translate-y-[2px]",
      // фокус
      "focus:outline-none",
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

// Определение компонента для выпадающего списка
export function ToolbarDropdownSelection({
                                           canvasMode,
                                           onSelectAction,
                                           isActiveAction,
                                         }: {
  canvasMode: CanvasMode;
  onSelectAction: (value: CanvasMode) => void;
  isActiveAction: (value: CanvasMode) => boolean;
}) {
  const tools = [
    {
      icon: cursor,
      value: CanvasMode.None,
      label: "Перемещение",
      kbd: "V",
    },
    {
      icon: hand,
      value: CanvasMode.Dragging,
      label: "Рука",
      kbd: "H",
    },
  ];

  // Проверяем, есть ли текущий canvasMode в списке инструментов
  const isValidMode = tools.some((tool) => tool.value === canvasMode);

  // Состояние для отображаемого значения
  const [selectedValue, setSelectedValue] = React.useState<CanvasMode>(
      isValidMode ? canvasMode : CanvasMode.None
  );

  // Следим за изменением canvasMode
  React.useEffect(() => {
    if (isValidMode) {
      console.log("Обновляем selectedValue:", canvasMode);
      setSelectedValue(canvasMode);
    }
  }, [canvasMode, isValidMode]);

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
                (isActiveAction(selectedValue) ?? isOpen) && "bg-bg-weak-50",
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
            {/* Рендерим только если mode есть в tools */}
            {tools.find((tool) => tool.value === selectedValue)?.icon ? (
                React.createElement(
                    tools.find((tool) => tool.value === selectedValue)!.icon
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
          {tools.map((tool) => (
              <Dropdown.Item
                  key={tool.value}
                  onSelect={() => onSelectAction(tool.value)}
                  className="flex cursor-pointer items-center rounded-md"
              >
                <div className="flex w-4 items-center justify-center">
                  {selectedValue === tool.value && (
                      <RiCheckLine className={cnExt(selectItemCheckIcon())} />
                  )}
                </div>
                <tool.icon className={cnExt(selectItemIcon())} />
                <span className={cnExt(selectItemLabel())}>{tool.label}</span>
                <Kbd.Root className={cnExt(selectItemKbd())}>{tool.kbd}</Kbd.Root>
              </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Root>
  );
}



