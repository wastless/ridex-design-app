'use client';

import * as React from 'react';
import { RiSipLine } from '@remixicon/react';
import {
  Input as AriaInput,
  getColorChannels,
  parseColor,
} from 'react-aria-components';
import type { ColorSpace, Color as AriaColor } from 'react-aria-components';

import * as Button from '~/components/ui/button';
import * as ColorPicker from '~/components/ui/color-picker';
import * as Divider from '~/components/ui/divider';
import * as Input from '~/components/ui/input';
import * as Popover from '~/components/ui/popover';
import * as Select from '~/components/ui/select';
import { hexToRgb } from '~/utils';
import { useCanvas } from '~/components/canvas/helper/CanvasContext';

function EyeDropperButton() {
  return (
    <Button.Root
      size='xsmall'
      variant='neutral'
      mode='stroke'
      className='rounded-r-none focus-visible:z-10 hover:[&:not(:focus-within)]:!ring-stroke-soft-200'
      asChild
    >
      <ColorPicker.EyeDropperButton>
        <Button.Icon as={RiSipLine} />
      </ColorPicker.EyeDropperButton>
    </Button.Root>
  );
}

const colorSwatches = [
  '#717784',
  '#335CFF',
  '#FF8447',
  '#FB3748',
  '#1FC16B',
  '#F6B51E',
  '#7D52F4',
  '#47C2FF',
];

interface ColorProps {
  value: string;
  onChange: (color: string, alpha?: number) => void;
  _label?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function Color({ value, onChange, _label, className, onOpenChange }: ColorProps) {
  const [color, setColor] = React.useState(parseColor(value || 'hsl(228, 100%, 60%)'));
  const [space, setSpace] = React.useState<ColorSpace | 'hex'>('hex');
  const [isOpen, setIsOpen] = React.useState(false);
  const { history } = useCanvas();

  // Update internal color state when external value changes
  React.useEffect(() => {
    try {
      setColor(parseColor(value));
    } catch {
      // If parsing fails, keep the current color
    }
  }, [value]);

  // Call the external onChange when internal color changes
  const handleColorChange = (newColor: AriaColor) => {
    setColor(newColor);
    try {
      // Extract alpha value from the color
      const alpha = newColor?.getChannelValue('alpha') ?? 1;
      // Convert to hex with alpha
      const hexColor = newColor?.toString('hex') ?? '#000000';
      // Add alpha channel to hex color
      const hexWithAlpha = (hexColor.startsWith('#') ? hexColor : '#' + hexColor) + Math.round(alpha * 255).toString(16).padStart(2, '0');
      // Pass both the color and alpha to the onChange handler
      onChange(hexWithAlpha, Math.round(alpha * 100));
    } catch {
      onChange('#000000ff', 100);
    }
  };

  // Get hex color code without # symbol
  const hexColor = color?.toString('hex').substring(1) ?? '000000';

  // Handle popover open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Pause history recording when color picker opens
      history.pause();
    } else {
      // Resume history recording when color picker closes
      history.resume();
    }
    
    // Call the external onOpenChange handler if provided
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  return (
    <ColorPicker.Root value={color} onChange={handleColorChange}>
      <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <Button.Root variant='neutral' mode='stroke' size='xsmall' className={`justify-start ${className ?? ''}`}>
            <Button.Icon as={ColorPicker.Swatch} className='rounded-sm size-4' />
            <span className="text-paragraph-sm text-text-strong-950">{hexColor}</span>
          </Button.Root>
        </Popover.Trigger>
      
        <Popover.Content className='flex w-[272px] flex-col gap-3 rounded-2xl bg-bg-white-0 p-4 shadow-regular-md ring-1 ring-inset ring-stroke-soft-200'>
          <ColorPicker.Area
            colorSpace='hsl'
            xChannel='saturation'
            yChannel='lightness'
          >
            <ColorPicker.Thumb className='ring-static-white' />
          </ColorPicker.Area>

          <ColorPicker.Slider colorSpace='hsl' channel='hue'>
            <ColorPicker.SliderTrack>
              <ColorPicker.Thumb className='top-1/2' />
            </ColorPicker.SliderTrack>
          </ColorPicker.Slider>

          <ColorPicker.Slider colorSpace='hsl' channel='alpha'>
            <ColorPicker.SliderTrack>
              <ColorPicker.Thumb className='top-1/2' />
            </ColorPicker.SliderTrack>
          </ColorPicker.Slider>

          <div className='flex flex-col items-start gap-1'>
            <Select.Root
              value={space}
              onValueChange={(s) => setSpace(s as ColorSpace)}
              aria-label='Color Space'
              variant='inline'
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content aria-label='items'>
                <Select.Item id='hex' value='hex'>
                  HEX
                </Select.Item>
                <Select.Item id='rgb' value='rgb'>
                  RGB
                </Select.Item>
                <Select.Item id='hsl' value='hsl'>
                  HSL
                </Select.Item>
                <Select.Item id='hsb' value='hsb'>
                  HSB
                </Select.Item>
              </Select.Content>
            </Select.Root>

            <div className='flex w-full -space-x-px'>
              <EyeDropperButton />
              <div className='flex -space-x-px'>
                {space === 'hex' ? (
                  <Input.Root
                    size='xsmall'
                    className='flex-[3] rounded-none focus-within:z-10 hover:[&:not(:focus-within)]:before:!ring-stroke-soft-200'
                    asChild
                  >
                    <ColorPicker.Field colorSpace='hsb'>
                      <Input.Wrapper>
                        <Input.Input asChild>
                          <AriaInput />
                        </Input.Input>
                      </Input.Wrapper>
                    </ColorPicker.Field>
                  </Input.Root>
                ) : (
                  getColorChannels(space).map((channel) => (
                    <Input.Root
                      key={channel}
                      size='xsmall'
                      className='flex-1 rounded-none focus-within:z-10 hover:[&:not(:focus-within)]:before:!ring-stroke-soft-200'
                      asChild
                    >
                      <ColorPicker.Field colorSpace={space} channel={channel}>
                        <Input.Wrapper>
                          <Input.Input asChild>
                            <AriaInput aria-label={channel.toString()} />
                          </Input.Input>
                        </Input.Wrapper>
                      </ColorPicker.Field>
                    </Input.Root>
                  ))
                )}
                <Input.Root
                  size='xsmall'
                  className='flex-1 rounded-l-none focus-within:z-10 hover:[&:not(:focus-within)]:before:!ring-stroke-soft-200'
                  asChild
                >
                  <ColorPicker.Field channel='alpha'>
                    <Input.Wrapper>
                      <Input.Input asChild>
                        <AriaInput aria-label='Alpha' />
                      </Input.Input>
                    </Input.Wrapper>
                  </ColorPicker.Field>
                </Input.Root>
              </div>
            </div>
          </div>

          <Divider.Root className='-mx-4 my-1 w-auto' />

          <div className='flex flex-col gap-2'>
            <div className='text-paragraph-xs text-text-sub-600'>
              Рекомендуемые цвета
            </div>
            <ColorPicker.SwatchPicker>
              {colorSwatches.map((color) => (
                <ColorPicker.SwatchPickerItem key={color} color={color}>
                  <ColorPicker.Swatch
                    style={{
                      ['--tw-ring-color' as string]: color,
                    }}
                  />
                </ColorPicker.SwatchPickerItem>
              ))}
            </ColorPicker.SwatchPicker>
          </div>
        </Popover.Content>
      </Popover.Root>
    </ColorPicker.Root>
  );
}
