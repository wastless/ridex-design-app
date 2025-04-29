// ActionButton
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { PolymorphicComponentProps } from "~/utils/polymorphic";
import { recursiveCloneChildren } from "~/utils/recursive-clone-children";
import { tv, type VariantProps } from "~/utils/tv";

const ACTION_BUTTON_ROOT_NAME = "ActionButtonRoot";
const ACTION_BUTTON_ICON_NAME = "ActionButtonIcon";
const ACTION_BUTTON_TEXT_NAME = "ActionButtonText";

export const actionButtonVariants = tv({
  slots: {
    root: [
      // base
      "bg-primary-light text-text-white-0",
      "relative flex shrink-0 items-center justify-center rounded-full p-4",
      "transition duration-200 ease-out",
      // hover
      "hover:bg-bg-white-0 hover:text-primary-base hover:outline-4 hover:outline-primary-light",
    ],
    icon: "size-6",
    text: [
      "mt-2 text-paragraph-sm text-center text-text-white-0",
      "w-[80px] whitespace-nowrap overflow-visible",
    ],
  },
});

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

const ActionButtonRoot = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>(({ asChild, children, className, ...rest }, forwardedRef) => {
  const uniqueId = React.useId();
  const Component = asChild ? Slot : "button";
  const { root } = actionButtonVariants();

  // Separate icon and text children
  const iconChildren = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === ActionButtonIcon
  );
  
  const textChildren = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === ActionButtonText
  );

  const extendedIconChildren = recursiveCloneChildren(
    iconChildren as React.ReactElement[],
    {},
    [ACTION_BUTTON_ICON_NAME],
    uniqueId,
    asChild,
  );

  const extendedTextChildren = recursiveCloneChildren(
    textChildren as React.ReactElement[],
    {},
    [ACTION_BUTTON_TEXT_NAME],
    uniqueId,
    asChild,
  );

  return (
    <div className="flex flex-col items-center">
      <Component
        ref={forwardedRef}
        className={root({ class: className })}
        {...rest}
      >
        {extendedIconChildren}
      </Component>
      {extendedTextChildren}
    </div>
  );
});
ActionButtonRoot.displayName = ACTION_BUTTON_ROOT_NAME;

function ActionButtonIcon<T extends React.ElementType>({
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, {}>) {
  const Component = as || "div";
  const { icon } = actionButtonVariants();

  return <Component className={icon({ class: className })} {...rest} />;
}
ActionButtonIcon.displayName = ACTION_BUTTON_ICON_NAME;

function ActionButtonText<T extends React.ElementType>({
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, {}>) {
  const Component = as || "div";
  const { text } = actionButtonVariants();

  return <Component className={text({ class: className })} {...rest} />;
}
ActionButtonText.displayName = ACTION_BUTTON_TEXT_NAME;

export { ActionButtonRoot as Root, ActionButtonIcon as Icon, ActionButtonText as Text };
