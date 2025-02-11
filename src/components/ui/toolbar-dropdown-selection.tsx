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
    trigger: [
      "flex items-center justify-center",
      "relative flex shrink-0 items-center justify-center outline-none m-0 rounded-md",
      "transition duration-200 ease-out",
    ],
    icon: [
      // base
      "h-6 w-auto min-w-0 m-1 shrink-0 object-contain",
      "transition duration-200 ease-out",
    ],
    triggerArrow: [
      // base
      "ml-auto size-4 shrink-0",
      "transition duration-200 ease-out transform transition-transform",
    ],
    selectItemIcon: ["size-5 shrink-0 bg-[length:1.25rem] text-text-sub-600"],
    selectItemCheckIcon: ["size-4 shrink-0 text-text-sub-600 mr-2"],
    selectItemLabel: ["flex-1"],
    selectItemKbd: ["ml-auto "],
  },
});

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

export function ToolbarDropdownSelection({
  items,
  defaultValue,
  onSelectAction,
  isActiveAction,
}: ToolbarDropdownSelectionProps) {
  const [selectedValue, setSelectedValue] =
    React.useState<CanvasMode>(defaultValue);
  const {
    trigger,
    icon,
    triggerArrow,
    selectItemIcon,
    selectItemCheckIcon,
    selectItemLabel,
    selectItemKbd,
  } = toolbarDropdownVariants();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dropdown.Root onOpenChange={(open) => setIsOpen(open)}>
      <Dropdown.Trigger asChild>
        <button
          className={cnExt(
            trigger(),
            (isActiveAction(selectedValue) || isOpen) && "bg-bg-weak-50",
          )}
        >
          {items.map((item) =>
            item.value === selectedValue ? (
              <item.icon
                key={item.value}
                className={cnExt(
                  icon(),
                  isActiveAction(selectedValue)
                    ? "text-primary-base"
                    : "text-text-sub-600",
                )}
              />
            ) : null,
          )}
          <RiArrowDownSLine
            className={cnExt(
              triggerArrow(),
              isOpen ? "rotate-180" : "",
              isActiveAction(selectedValue)
                ? "text-primary-base"
                : "text-text-sub-600",
            )}
          />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content className="w-60">
        {items.map((item) => (
          <Dropdown.Item
            key={item.value}
            onSelect={() => {
              setSelectedValue(item.value);
              onSelectAction(item.value);
            }}
            className="flex cursor-pointer items-center rounded-md"
          >
            <div className="flex w-4 items-center justify-center">
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
