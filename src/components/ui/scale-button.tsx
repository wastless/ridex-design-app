// AlignUI Select v0.0.0

'use client';

import * as React from 'react';
import * as ScrollAreaPrimitives from '@radix-ui/react-scroll-area';
import * as SelectPrimitives from '@radix-ui/react-select';
import { Slottable } from '@radix-ui/react-slot';
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react';

import { cn } from "utils/cn";
import type { PolymorphicComponentProps } from 'utils/polymorphic';
import { tv, type VariantProps } from 'utils/tv';
import { useCanvas } from '~/components/canvas/helper/CanvasContext';

// Define scale items
export const scaleItems = [
  { value: "0.25", label: "25%" },
  { value: "0.5", label: "50%" },
  { value: "1", label: "100%" },
  { value: "1.5", label: "150%" },
  { value: "2", label: "200%" },
];

export const selectVariants = tv({
  slots: {
    triggerRoot: [
      // base
      'group/trigger min-w-0 shrink-0 bg-bg-white-0 outline-nonew-auto',
      'h-8 gap-0.5 rounded-lg pl-2.5 pr-1.5',
      'text-paragraph-sm text-text-strong-950',
      'flex items-center text-left',
      'transition duration-200 ease-out',
      // hover
      'hover:bg-transparent hover:text-text-strong-950',
      // focus
      'focus:shadow-none',
      // disabled
      'disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:shadow-none disabled:ring-transparent data-[placeholder]:disabled:text-text-disabled-300',
      // placeholder state
      'data-[placeholder]:text-text-sub-600',
    ],
    triggerArrow: [
      // base
      'ml-auto size-5 shrink-0',
      'transition duration-200 ease-out',
      // placeholder state
      'group-data-[placeholder]/trigger:text-text-soft-400',
      // filled state
      'text-text-sub-600',
      // hover
      'group-hover/trigger:text-text-sub-600 group-data-[placeholder]/trigger:group-hover:text-text-sub-600',
      // focus
      'group-focus/trigger:text-text-strong-950 group-data-[placeholder]/trigger:group-focus/trigger:text-text-strong-950',
      // disabled
      'group-disabled/trigger:text-text-disabled-300 group-data-[placeholder]/trigger:group-disabled/trigger:text-text-disabled-300',
      // open
      'group-data-[state=open]/trigger:rotate-180',
    ],
  },
});

type SelectContextType = {};

const SelectContext = React.createContext<SelectContextType>({});

const useSelectContext = () => React.useContext(SelectContext);

const SelectRoot = ({
  ...rest
}: React.ComponentProps<typeof SelectPrimitives.Root>) => {
  return (
    <SelectContext.Provider value={{}}>
      <SelectPrimitives.Root {...rest} />
    </SelectContext.Provider>
  );
};
SelectRoot.displayName = 'SelectRoot';

const SelectGroup = SelectPrimitives.Group;
SelectGroup.displayName = 'SelectGroup';

const SelectValue = SelectPrimitives.Value;
SelectValue.displayName = 'SelectValue';

const SelectSeparator = SelectPrimitives.Separator;
SelectSeparator.displayName = 'SelectSeparator';

const SelectGroupLabel = SelectPrimitives.Label;
SelectGroupLabel.displayName = 'SelectGroupLabel';

const SELECT_TRIGGER_ICON_NAME = 'SelectTriggerIcon';

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Trigger>
>(({ className, children, ...rest }, forwardedRef) => {
  const { camera } = useCanvas();

  const { triggerRoot, triggerArrow } = selectVariants({});

  return (
    <SelectPrimitives.Trigger
      ref={forwardedRef}
      className={cn(
        triggerRoot({ class: className }),
        // Remove focus outline
        'focus:outline-none focus:ring-0'
      )}
      {...rest}
    >
      <Slottable>{children}</Slottable>
      <span>{Math.round(camera.zoom * 100)}%</span>
      <SelectPrimitives.Icon asChild>
        <RiArrowDownSLine className={triggerArrow()} />
      </SelectPrimitives.Icon>
    </SelectPrimitives.Trigger>
  );
});

SelectTrigger.displayName = 'SelectTrigger';


const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Content>
>(
  (
    {
      className,
      position = 'popper',
      children,
      sideOffset = 8,
      collisionPadding = 8,
      ...rest
    },
    forwardedRef,
  ) => (
    <SelectPrimitives.Portal>
      <SelectPrimitives.Content
        ref={forwardedRef}
        className={cn(
          // base
          'relative z-50 overflow-hidden rounded-2xl bg-bg-white-0 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200',
          // widths
          'min-w-[--radix-select-trigger-width] max-w-[max(var(--radix-select-trigger-width),320px)]',
          // heights
          'max-h-[--radix-select-content-available-height]',
          // animation
          'data-[state=open]:animate-in data-[state=open]:fade-in-0',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        sideOffset={sideOffset}
        position={position}
        collisionPadding={collisionPadding}
        {...rest}
      >
        <ScrollAreaPrimitives.Root type='auto'>
          <SelectPrimitives.Viewport asChild>
            <ScrollAreaPrimitives.Viewport
              style={{ overflowY: undefined }}
              className='max-h-[196px] w-full scroll-py-2 overflow-auto p-2'
            >
              {children}
            </ScrollAreaPrimitives.Viewport>
          </SelectPrimitives.Viewport>
          <ScrollAreaPrimitives.Scrollbar orientation='vertical'>
            <ScrollAreaPrimitives.Thumb className='!w-1 rounded bg-bg-soft-200' />
          </ScrollAreaPrimitives.Scrollbar>
        </ScrollAreaPrimitives.Root>
      </SelectPrimitives.Content>
    </SelectPrimitives.Portal>
  ),
);

SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item>
>(({ className, children, ...rest }, forwardedRef) => {
  return (
    <SelectPrimitives.Item
      ref={forwardedRef}
      className={cn(
        // base
        'group relative cursor-pointer select-none rounded-lg p-2 pr-9 text-paragraph-sm text-text-strong-950',
        'flex items-center gap-2 transition duration-200 ease-out',
        // disabled
        'data-[disabled]:pointer-events-none data-[disabled]:text-text-disabled-300',
        // hover, focus
        'data-[highlighted]:bg-bg-weak-50 data-[highlighted]:outline-0',        // Remove focus outline
        'focus:outline-none focus:ring-0',
        className,
      )}
      {...rest}
    >
      <SelectPrimitives.ItemText asChild>
        <span
          className={cn(
            // base
            'flex flex-1 items-center gap-2',
            // disabled
            'group-disabled:text-text-disabled-300',
          )}
        >
          {typeof children === 'string' ? (
            <span className='line-clamp-1'>{children}</span>
          ) : (
            children
          )}
        </span>
      </SelectPrimitives.ItemText>
      <SelectPrimitives.ItemIndicator asChild>
        <RiCheckLine className='absolute right-2 top-1/2 size-5 shrink-0 -translate-y-1/2 text-text-sub-600' />
      </SelectPrimitives.ItemIndicator>
    </SelectPrimitives.Item>
  );
});

SelectItem.displayName = 'SelectItem';


export {
  SelectRoot as Root,
  SelectContent as Content,
  SelectGroup as Group,
  SelectGroupLabel as GroupLabel,
  SelectItem as Item,
  SelectSeparator as Separator,
  SelectTrigger as Trigger,
  SelectValue as Value,
};
