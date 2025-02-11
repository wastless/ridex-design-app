/*** Рендеринг кнопки с выпадающем списком инструментов перемещения в панели инструментов ***/
"use client";

import * as React from "react";
import * as Dropdown from "~/components/ui/dropdown";
import * as Kbd from "~/components/ui/kbd";
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react";
import { cnExt } from "utils/cn";
import { CanvasMode } from "~/types";
import { tv } from "utils/tv";

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

// Определение типов пропсов для компонента
type ToolbarDropdownSelectionProps = {
  items: {
    icon: React.ElementType;
    value: CanvasMode;
    label: string;
    kbd: string;
  }[];
  defaultValue: CanvasMode;
  onSelectAction: (value: CanvasMode) => void | undefined;
  isActiveAction: (value: CanvasMode) => boolean | undefined;
};

// Определение компонента для выпадающего списка
export function ToolbarDropdownSelection({
  items,
  defaultValue,
  onSelectAction,
  isActiveAction,
}: ToolbarDropdownSelectionProps) {
  const [selectedValue, setSelectedValue] =
    React.useState<CanvasMode>(defaultValue);

  const {
    container,
    iconButton,
    arrowButton,
    selectItemIcon,
    selectItemCheckIcon,
    selectItemLabel,
    selectItemKbd,
  } = toolbarDropdownVariants();

  const [isOpen, setIsOpen] = React.useState(false); // Состояние, отслеживающее, открыт ли список

  return (
    <Dropdown.Root onOpenChange={(open) => setIsOpen(open)}>
      {/*Триггер выпадающего списка*/}
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
          onClick={() => {
            setSelectedValue(selectedValue);
            onSelectAction(selectedValue);
          }}
        >
          {items.map((item) =>
            item.value === selectedValue ? (
              <item.icon key={item.value} />
            ) : null,
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

      <Dropdown.Content className="w-60" >
        {items.map((item) => (
          <Dropdown.Item
            key={item.value}
            onSelect={() => {
              setSelectedValue(item.value);
              onSelectAction(item.value);
            }}
            className="flex cursor-pointer items-center rounded-md "
          >
            <div className="flex w-4 items-center justify-center ">
              {selectedValue === item.value && (
                <RiCheckLine className={cnExt(selectItemCheckIcon())} />
              )}
            </div>
            <item.icon className={cnExt(selectItemIcon())} />
            <span className={cnExt(selectItemLabel())}>{item.label}</span>
            <Kbd.Root className={cnExt(selectItemKbd())}>{item.kbd}</Kbd.Root>
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
