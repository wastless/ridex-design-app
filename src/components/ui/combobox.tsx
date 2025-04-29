'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react';

import { cn } from '~/utils/cn';
import { tv, type VariantProps } from '~/utils/tv';

const comboboxVariants = tv({
  slots: {
    root: [
      'group relative flex w-full min-w-0 shrink-0 bg-bg-white-0 shadow-regular-xs outline-none ring-1 ring-inset ring-stroke-soft-200',
      'text-paragraph-sm text-text-strong-950',
      'transition duration-200 ease-out',
      'hover:bg-bg-weak-50 hover:ring-transparent',

      'disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300 disabled:shadow-none disabled:ring-transparent',
    ],
    input: [
      'flex h-full w-full bg-transparent text-sm outline-none placeholder:text-text-sub-600',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'pl-2 pr-2 py-2',
    ],
    arrow: [
      'absolute right-0 top-0 bottom-0 flex w-8 items-center justify-center border-l border-stroke-soft-200',
      'transition duration-200 ease-out',
      'text-text-sub-600',
      'group-hover:text-text-sub-600',
      'group-focus-within:text-text-strong-950',
      'group-disabled:text-text-disabled-300',
      'group-data-[state=open]:rotate-180',
    ],
    content: [
      'relative z-50 overflow-hidden rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'max-h-[--radix-popover-content-available-height]',
    ],
    item: [
      'group relative cursor-pointer select-none rounded-lg p-2 pr-9 text-paragraph-sm text-text-strong-950',
      'flex items-center gap-2 transition duration-200 ease-out',
      'hover:bg-bg-weak-50 focus:outline-none',
      'w-full',
    ],
  },
  variants: {
    size: {
      medium: {
        root: 'h-10 min-h-10 rounded-10',
      },
      small: {
        root: 'h-9 min-h-9 rounded-lg',
      },
      xsmall: {
        root: 'h-8 min-h-8 rounded-lg',
      },
    },
    hasError: {
      true: {
        root: [
          'ring-error-base',
          'focus-within:shadow-button-error-focus focus-within:ring-error-base',
        ],
      },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});

type ComboboxSize = VariantProps<typeof comboboxVariants>['size'];

interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value?: string;
  onValueChange?: (value: string) => void;
  items?: { value: string; label: string }[];
  size?: ComboboxSize;
  hasError?: VariantProps<typeof comboboxVariants>['hasError'];
  mode?: 'select' | 'input';
  fontFamily?: string;
}

const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  ({ className, value, onValueChange, items = [], size, hasError, mode = 'select', fontFamily }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value ?? '');
    const [suggestion, setSuggestion] = React.useState('');
    const internalRef = React.useRef<HTMLInputElement>(null);
    const { root, input, arrow, content, item } = comboboxVariants({ size, hasError });

    // Обновляем inputValue при изменении value извне
    React.useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    // Находим первое совпадение для автоподстановки
    const findSuggestion = React.useCallback((text: string) => {
      if (!text || mode === 'input') return '';
      const lowerText = text.toLowerCase();
      const match = items.find(item => 
        item.value.toLowerCase().startsWith(lowerText) || 
        item.label.toLowerCase().startsWith(lowerText)
      );
      return match ? match.value : '';
    }, [items, mode]);

    // Обработка ввода текста
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      if (mode === 'select') {
        const newSuggestion = findSuggestion(newValue);
        setSuggestion(newSuggestion);
      }
    };

    // Обработка подтверждения (Enter, Tab)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (mode === 'select' && suggestion) {
          e.preventDefault();
          onValueChange?.(suggestion);
          setInputValue(suggestion);
          setSuggestion('');
        } else if (mode === 'input') {
          e.preventDefault();
          onValueChange?.(inputValue);
          internalRef.current?.blur();
        }
      } else if (e.key === 'Tab' && suggestion && mode === 'select') {
        e.preventDefault();
        onValueChange?.(suggestion);
        setInputValue(suggestion);
        setSuggestion('');
      }
    };

    // Обработка потери фокуса
    const handleBlur = () => {
      if (mode === 'select' && value !== undefined) {
        setInputValue(value);
      }
      setSuggestion('');
    };

    // Обработка фокуса
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    };

    // Объединяем внешний и внутренний ref
    React.useImperativeHandle(ref, () => internalRef.current!);

    // Проверяем, нужно ли показывать подсказку
    const shouldShowSuggestion = mode === 'select' && suggestion && 
      suggestion.toLowerCase() !== inputValue.toLowerCase() && 
      suggestion.toLowerCase().startsWith(inputValue.toLowerCase());

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <div 
          className={root({ class: className })}
          ref={(node) => {
            if (node) {
              node.style.setProperty('--combobox-width', `${node.offsetWidth}px`);
            }
          }}
        >
          <div className="relative flex-1">
            <input
              ref={internalRef}
              className={cn(
                input(),
                'bg-transparent',
                fontFamily && { fontFamily }
              )}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={handleFocus}
              style={{ fontFamily: 'system-ui', fontWeight: 400 }}
            />
            {shouldShowSuggestion && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ fontFamily: 'system-ui', fontWeight: 400 }}
              >
                <div className="absolute inset-0 flex items-center pl-2 pr-2 h-full">
                  <span className="invisible">{inputValue}</span>
                  <span className="text-text-sub-600 leading-[1.5] text-sm">
                    {suggestion.slice(inputValue.length)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <PopoverPrimitive.Trigger asChild>
            <button className={arrow()}>
              <RiArrowDownSLine className="size-5" />
            </button>
          </PopoverPrimitive.Trigger>
        </div>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content 
            className={content()}
            align="start"
            sideOffset={4}
            style={{ width: 'var(--combobox-width)' }}
          >
            <div className="max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stroke-soft-200 hover:[&::-webkit-scrollbar-thumb]:bg-stroke-soft-300">
              {items.map(({ value: itemValue, label }) => (
                <div
                  key={itemValue}
                  className={item()}
                  onClick={() => {
                    onValueChange?.(itemValue);
                    setInputValue(itemValue);
                    setOpen(false);
                  }}
                  style={{ fontFamily: itemValue }}
                >
                  <span className="flex flex-1 items-center gap-2">
                    <span className="line-clamp-1">{label}</span>
                  </span>
                  {itemValue === value && (
                    <RiCheckLine className="absolute right-2 top-1/2 size-5 shrink-0 -translate-y-1/2 text-text-sub-600" />
                  )}
                </div>
              ))}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);

Combobox.displayName = 'Combobox';

export { Combobox }; 