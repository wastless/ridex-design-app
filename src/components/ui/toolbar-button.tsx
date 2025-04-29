/*** Рендеринг кнопки в панели инструментов ***/
"use client";

import * as React from "react";
import { tv } from "~/utils/tv";
import { cn } from '~/utils/cn';
import type { IconComponent } from '~/types/icon';


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
      "data-[state=active]:bg-bg-weak-50 data-[state=active]:text-primary-base",
    ],
    icon: "size-6",
  },
});

interface ToolbarButtonRootProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'neutral' | 'primary';
  mode?: 'ghost' | 'solid';
  size?: 'xsmall' | 'small' | 'medium';
  isActive?: boolean;
}

interface ToolbarButtonIconProps {
  as: IconComponent;
  className?: string;
}

const ToolbarButtonRoot = React.forwardRef<HTMLButtonElement, ToolbarButtonRootProps>(
  ({ className, variant = 'neutral', mode = 'ghost', size = 'medium', isActive, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-state={isActive ? 'active' : undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-lg',
          size === 'xsmall' && 'h-8 w-8',
          size === 'small' && 'h-9 w-9',
          size === 'medium' && 'h-10 w-10',
          mode === 'ghost' && 'hover:bg-bg-weak-50',
          mode === 'solid' && variant === 'neutral' && 'bg-bg-weak-50 hover:bg-bg-weak-100',
          mode === 'solid' && variant === 'primary' && 'bg-primary-50 hover:bg-primary-100',
          isActive && 'bg-bg-weak-50 text-primary-base',
          className
        )}
        {...props}
      />
    );
  }
);
ToolbarButtonRoot.displayName = 'ToolbarButtonRoot';

const ToolbarButtonIcon: React.FC<ToolbarButtonIconProps> = ({ as: Component, className }) => {
  return (
    <Component className={cn('size-5 text-text-sub-600', className)} />
  );
};
ToolbarButtonIcon.displayName = 'ToolbarButtonIcon';

export {
  ToolbarButtonRoot as Root,
  ToolbarButtonIcon as Icon,
};
