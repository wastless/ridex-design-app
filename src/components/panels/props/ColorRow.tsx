'use client';

import React, { useState, useEffect } from 'react';
import { colorToCss } from '~/utils';
import { Layer } from '~/types';
import { Color as ColorPicker } from './Color';
import * as Button from '~/components/ui/button';
import * as Input from '~/components/ui/tageditor';
import { style_16, minus_16, plus_16, percent_16 } from '~/icon';
import { useCanvas } from '~/components/canvas/helper/CanvasContext';
import ContrastDisplay from './ContrastDisplay';

interface ColorRowProps {
  layer: Layer;
  onUpdateLayer: (updates: { fill?: string | null }) => void;
  onColorChange: (color: string, type: 'fill' | 'stroke') => void;
}

export default function ColorRow({ layer, onUpdateLayer, onColorChange }: ColorRowProps) {
  const [hasFillColor, setHasFillColor] = useState(false);
  const { history } = useCanvas();

  // Update hasFillColor state when layer changes
  useEffect(() => {
    if (layer) {
      setHasFillColor(layer.fill !== null);
    }
  }, [layer]);

  // Function to remove fill color
  const handleRemoveFillColor = () => {
    onUpdateLayer({ fill: null });
    setHasFillColor(false);
  };

  // Function to add fill color
  const handleAddFillColor = () => {
    // Default color when adding a new fill
    const defaultColor = { r: 217, g: 217, b: 217, a: 255 };
    // Convert the color object to a hex string
    const hexColor = colorToCss(defaultColor);
    onUpdateLayer({ fill: hexColor });
    setHasFillColor(true);
  };

  // Handle color picker open/close
  const handleColorPickerOpenChange = (open: boolean) => {
    if (open) {
      // Pause history recording when color picker opens
      history.pause();
    } else {
      // Resume history recording when color picker closes
      history.resume();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Заливка */}
      <div className="flex flex-row items-center justify-between">
        <span className="text-paragraph-sm text-text-strong-950">
          Заливка
        </span>
        <div className="flex flex-row gap-0">
          <Button.Root variant="neutral" mode="ghost" size="xsmall">
            <Button.Icon as={style_16} />
          </Button.Root>
          {hasFillColor ? (
            <Button.Root 
              variant="neutral" 
              mode="ghost" 
              size="xsmall"
              onClick={handleRemoveFillColor}
            >
              <Button.Icon as={minus_16} />
            </Button.Root>
          ) : (
            <Button.Root 
              variant="neutral" 
              mode="ghost" 
              size="xsmall"
              onClick={handleAddFillColor}
            >
              <Button.Icon as={plus_16} />
            </Button.Root>
          )}
        </div>
      </div>

      {hasFillColor && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <div className="flex w-full flex-row gap-1.5">
              <div className="flex-1 min-w-0">
                <ColorPicker
                  value={colorToCss(layer.fill ?? { r: 0, g: 0, b: 0, a: 255 })}
                  onChange={(color) => {
                    if (!color) return;
                    onColorChange(color, 'fill');
                  }}
                  className="w-full h-8"
                  onOpenChange={handleColorPickerOpenChange}
                />
              </div>

              <div className="w-[64px] flex-shrink-0">
                <Input.Root>
                  <Input.Wrapper iconPosition="right">
                    <Input.Input
                      type="number"
                      value={Math.round((layer.fill?.a ?? 255) / 255 * 100)}
                      min={0}
                      max={100}
                      step="1"
                      onChange={(e) => {
                        const number = parseFloat(e.target.value);
                        if (!isNaN(number)) {
                          // Convert percentage to alpha value (0-255)
                          const alphaValue = Math.round((number / 100) * 255);
                          
                          // Get current color or default to black
                          const currentColor = layer.fill ?? { r: 0, g: 0, b: 0, a: 255 };
                          
                          // Create new color with updated alpha and convert to hex
                          const hexColor = colorToCss({
                            ...currentColor,
                            a: alphaValue
                          });
                          
                          // Update the layer with the new color
                          onColorChange(hexColor, 'fill');
                        }
                      }}
                    />
                    <Input.Icon as={percent_16} />
                  </Input.Wrapper>
                </Input.Root>
              </div>
            </div>
          </div>
          
          {/* Добавляем отображение контраста */}
          <ContrastDisplay 
            colorHex={colorToCss(layer.fill ?? { r: 0, g: 0, b: 0, a: 255 })} 
            layer={layer} 
          />
        </div>
      )}
    </div>
  );
} 