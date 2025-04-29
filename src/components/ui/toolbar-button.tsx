/*** Рендеринг кнопки в панели инструментов ***/
"use client";

import * as React from "react";
import type { PolymorphicComponentProps } from "~/utils/polymorphic";
import { recursiveCloneChildren } from "~/utils/recursive-clone-children";
import { tv } from "~/utils/tv";
import { Slot } from "@radix-ui/react-slot";

// Определение констант для имени компонентов
const TOOLBAR_BUTTON_ROOT_NAME = "ToolbarButtonRoot";
const TOOLBAR_BUTTON_ICON_NAME = "ToolbarButtonIcon";

export const toolbarButtonVariants = tv({
  slots: {
    root: [
      // Базовые стили
      "relative flex shrink-0 items-center justify-center outline-none size-8 m-0 rounded-md text-text-sub-600",
      "transition duration-200 ease-out",
      // Стили для отключенного состояния
      "disabled:pointer-events-none disabled:border-transparent disabled:bg-transparent disabled:text-text-disabled-300 disabled:shadow-none",
      // Стили при фокусе
      "focus:outline-none",
      // Стили при наведении
      "hover:bg-bg-weak-50 hover:text-text-sub-600",
      // Стили в активном состоянии
      "active:bg-bg-weak-50 active:text-primary-base",
    ],
    icon: "size-6",
  },
});

// Определение типов пропсов для компонента
type ToolbarButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  onClick: () => void;
  isActive?: boolean;
};

// Определение компонента для кнопки
const ToolbarButtonRoot = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(
  (
    { asChild, onClick, isActive, children, className, ...rest },
    forwardedRef,
  ) => {
    const uniqueId = React.useId();
    const Component = asChild ? Slot : "button";
    const { root } = toolbarButtonVariants();

    const extendedChildren = recursiveCloneChildren(
      children as React.ReactElement[],
      { isActive },
      [TOOLBAR_BUTTON_ICON_NAME],
      uniqueId,
      asChild,
    );
    return (
      <Component
        ref={forwardedRef}
        className={`${root({ class: className })} ${isActive ? "bg-bg-weak-50" : ""}`}
        onClick={onClick}
        {...rest}
      >
        {extendedChildren}
      </Component>
    );
  },
);

ToolbarButtonRoot.displayName = TOOLBAR_BUTTON_ROOT_NAME;

// Определение компонента для иконки кнопки
function ToolbarButtonIcon<T extends React.ElementType>({
  as,
  className,
  isActive,
  ...rest
}: PolymorphicComponentProps<T> & { isActive?: boolean }) {
  const Component = as ?? "div";
  const { icon } = toolbarButtonVariants();

  return (
    <Component
      className={`${icon({ class: className })} ${isActive ? "text-primary-base" : ""}`}
      {...rest}
    />
  );
}

ToolbarButtonIcon.displayName = TOOLBAR_BUTTON_ICON_NAME;

export { ToolbarButtonRoot as Root, ToolbarButtonIcon as Icon };
