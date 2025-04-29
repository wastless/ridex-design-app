// Input

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import type { PolymorphicComponentProps } from "~/utils/polymorphic";
import { recursiveCloneChildren } from "~/utils/recursive-clone-children";
import { tv, type VariantProps } from "~/utils/tv";

const INPUT_ROOT_NAME = "InputRoot";
const INPUT_WRAPPER_NAME = "InputWrapper";
const INPUT_EL_NAME = "InputEl";
const INPUT_ICON_NAME = "InputIcon";
const INPUT_AFFIX_NAME = "InputAffixButton";
const INPUT_INLINE_AFFIX_NAME = "InputInlineAffixButton";

export const inputVariants = tv({
  slots: {
    root: [
      // base
      "group relative flex w-full overflow-hidden bg-bg-white-0 text-text-strong-950",
      "transition duration-200 ease-out",
      "divide-x divide-stroke-soft-200",
      // before
      "before:absolute before:inset-0 before:ring-1 before:ring-inset before:ring-stroke-soft-200",
      "before:pointer-events-none before:rounded-[inherit]",
      "before:transition before:duration-200 before:ease-out",
      // hover
      "hover:shadow-none",
      // focus
      "has-[input:focus]:before:ring-stroke-strong-950",
      // disabled
      "has-[input:disabled]:shadow-none has-[input:disabled]:before:ring-stroke-soft-200",
      "rounded-lg",
    ],
    wrapper: [
      // base
      "group/input-wrapper flex w-full cursor-text items-center bg-bg-white-0",
      "transition duration-200 ease-out",
      // hover
      "hover:bg-bg-weak-50",
      // disabled
      "has-[input:disabled]:pointer-events-none has-[input:disabled]:ring-stroke-soft-200",
      "gap-1.5",
      // icon position variants
      "data-[icon-position=left]:px-1",
      "data-[icon-position=right]:pl-2 data-[icon-position=right]:pr-1",
    ],
    input: [
      // base
      "w-full bg-transparent bg-none text-paragraph-sm text-text-strong-950 outline-none",
      "transition duration-200 ease-out",
      // placeholder
      "placeholder:select-none placeholder:text-text-soft-400 placeholder:transition placeholder:duration-200 placeholder:ease-out",
      // hover placeholder
      "group-hover/input-wrapper:placeholder:text-text-sub-600",
      // focus
      "focus:outline-none",
      // focus placeholder
      "group-has-[input:focus]:placeholder:text-text-sub-600",
      // disabled
      "disabled:text-text-disabled-300 disabled:placeholder:text-text-disabled-300",
      // remove spinners
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      "h-8 py-2",
    ],
    icon: [
      // base
      "flex size-4 shrink-0 select-none items-center justify-center",
      "transition duration-200 ease-out",
      // placeholder state
      "group-has-[:placeholder-shown]:text-text-soft-400",
      // filled state
      "text-text-sub-600",
      // hover
      "group-has-[:placeholder-shown]:group-hover/input-wrapper:text-text-sub-600",
      // focus
      "group-has-[:placeholder-shown]:group-has-[input:focus]/input-wrapper:text-text-sub-600",
      // disabled
      "group-has-[input:disabled]/input-wrapper:text-text-disabled-300",
    ],
    affix: [
      // base
      "shrink-0 bg-bg-white-0 text-paragraph-sm text-text-sub-600",
      "flex items-center justify-center truncate",
      "transition duration-200 ease-out",
      // placeholder state
      "group-has-[:placeholder-shown]:text-text-soft-400",
      // focus state
      "group-has-[:placeholder-shown]:group-has-[input:focus]:text-text-sub-600",
      "px-2.5",
    ],
    inlineAffix: [
      // base
      "text-paragraph-sm text-text-sub-600",
      // placeholder state
      "group-has-[:placeholder-shown]:text-text-soft-400",
      // focus state
      "group-has-[:placeholder-shown]:group-has-[input:focus]:text-text-sub-600",
    ],
  },
});

type InputSharedProps = VariantProps<typeof inputVariants> & {
  iconPosition?: 'left' | 'right';
};

function InputRoot({
  className,
  children,
  asChild,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> &
  InputSharedProps & {
    asChild?: boolean;
  }) {
  const uniqueId = React.useId();
  const Component = asChild ? Slot : "div";

  const { root } = inputVariants();

  const sharedProps: InputSharedProps = {};

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [
      INPUT_WRAPPER_NAME,
      INPUT_EL_NAME,
      INPUT_ICON_NAME,
      INPUT_AFFIX_NAME,
      INPUT_INLINE_AFFIX_NAME,
    ],
    uniqueId,
    asChild,
  );

  return (
    <Component className={root({ class: className })} {...rest}>
      {extendedChildren}
    </Component>
  );
}

InputRoot.displayName = INPUT_ROOT_NAME;

function InputWrapper({
  className,
  children,
  asChild,
  iconPosition = 'left',
  ...rest
}: React.HTMLAttributes<HTMLLabelElement> &
  InputSharedProps & {
    asChild?: boolean;
  }) {
  const Component = asChild ? Slot : "label";

  const { wrapper } = inputVariants();

  return (
    <Component 
      className={wrapper({ class: className })} 
      data-icon-position={iconPosition}
      {...rest}
    >
      {iconPosition === 'right' ? (
        <>
          {React.Children.toArray(children).filter(child => 
            React.isValidElement(child) && child.type !== InputIcon
          )}
          {React.Children.toArray(children).filter(child => 
            React.isValidElement(child) && child.type === InputIcon
          )}
        </>
      ) : children}
    </Component>
  );
}

InputWrapper.displayName = INPUT_WRAPPER_NAME;

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> &
    InputSharedProps & {
      asChild?: boolean;
    }
>(({ className, type = "text", asChild, ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : "input";

  const { input } = inputVariants();

  return (
    <Component
      type={type}
      className={input({ class: className })}
      ref={forwardedRef}
      {...rest}
    />
  );
});
Input.displayName = INPUT_EL_NAME;

function InputIcon<T extends React.ElementType = "div">({
  hasError,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, InputSharedProps>) {
  const Component = as || "div";
  const { icon } = inputVariants();

  return <Component className={icon({ class: className })} {...rest} />;
}

InputIcon.displayName = INPUT_ICON_NAME;

function InputAffix({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & InputSharedProps) {
  const { affix } = inputVariants();

  return (
    <div className={affix({ class: className })} {...rest}>
      {children}
    </div>
  );
}

InputAffix.displayName = INPUT_AFFIX_NAME;

function InputInlineAffix({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & InputSharedProps) {
  const { inlineAffix } = inputVariants();

  return (
    <span className={inlineAffix({ class: className })} {...rest}>
      {children}
    </span>
  );
}

InputInlineAffix.displayName = INPUT_INLINE_AFFIX_NAME;

export {
  InputRoot as Root,
  InputWrapper as Wrapper,
  Input,
  InputIcon as Icon,
  InputAffix as Affix,
  InputInlineAffix as InlineAffix,
};
