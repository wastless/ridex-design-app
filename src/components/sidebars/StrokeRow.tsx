'use client';

import React, { useState, useEffect } from 'react';
import { colorToCss, hexToRgb } from '~/utils';
import { Color as ColorType } from '~/types';
import { Color as ColorPicker } from './Color';
import * as Button from '~/components/ui/button';
import * as Input from '~/components/ui/tageditor';
import { style_16, minus_16, plus_16, percent_16 } from '~/icon';

interface StrokeRowProps {
  layer: any; // Using any for now, but ideally should be properly typed
  onUpdateLayer: (updates: { [key: string]: any }) => void;
  onColorChange: (color: string, type: 'fill' | 'stroke') => void;
}

export default function StrokeRow({ layer, onUpdateLayer, onColorChange }: StrokeRowProps) {
  const [hasStrokeColor, setHasStrokeColor] = useState(false);

  // Update hasStrokeColor state when layer changes
  useEffect(() => {
    if (layer) {
      setHasStrokeColor(layer.stroke !== null);
    }
  }, [layer]);

  // Function to remove stroke color
  const handleRemoveStrokeColor = () => {
    onUpdateLayer({ stroke: null });
    setHasStrokeColor(false);
  };

  // Function to add stroke color
  const handleAddStrokeColor = () => {
    // Default color when adding a new stroke
    const defaultColor = { r: 217, g: 217, b: 217, a: 255 };
    // Convert the color object to a hex string
    const hexColor = colorToCss(defaultColor);
    onUpdateLayer({ stroke: hexColor });
    setHasStrokeColor(true);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Обводка */}
      <div className="flex flex-row items-center justify-between">
        <span className="text-paragraph-sm text-text-strong-950">
          Обводка
        </span>
        <div className="flex flex-row gap-0">
          <Button.Root variant="neutral" mode="ghost" size="xsmall">
            <Button.Icon as={style_16} />
          </Button.Root>
          {hasStrokeColor ? (
            <Button.Root 
              variant="neutral" 
              mode="ghost" 
              size="xsmall"
              onClick={handleRemoveStrokeColor}
            >
              <Button.Icon as={minus_16} />
            </Button.Root>
          ) : (
            <Button.Root 
              variant="neutral" 
              mode="ghost" 
              size="xsmall"
              onClick={handleAddStrokeColor}
            >
              <Button.Icon as={plus_16} />
            </Button.Root>
          )}
        </div>
      </div>

      {hasStrokeColor && (
        <div className="flex flex-row items-center justify-between">
          <div className="flex w-full flex-row gap-1.5">
            <div className="flex-1 min-w-0">
              <ColorPicker
                value={colorToCss(layer?.stroke || { r: 0, g: 0, b: 0, a: 255 })}
                onChange={(color) => {
                  if (!color) return;
                  onColorChange(color, 'stroke');
                }}
                className="w-full h-8"
              />
            </div>

            <div className="w-[64px] flex-shrink-0">
              <Input.Root>
                <Input.Wrapper iconPosition="right">
                  <Input.Input
                    type="number"
                    value={Math.round((layer?.stroke?.a ?? 255) / 255 * 100)}
                    min={0}
                    max={100}
                    step="1"
                    onChange={(e) => {
                      const number = parseFloat(e.target.value);
                      if (!isNaN(number)) {
                        // Convert percentage to alpha value (0-255)
                        const alphaValue = Math.round((number / 100) * 255);
                        
                        // Get current color or default to black
                        const currentColor = layer?.stroke || { r: 0, g: 0, b: 0, a: 255 };
                        
                        // Create new color with updated alpha and convert to hex
                        const hexColor = colorToCss({
                          ...currentColor,
                          a: alphaValue
                        });
                        
                        // Update the layer with the new color
                        onColorChange(hexColor, 'stroke');
                      }
                    }}
                  />
                  <Input.Icon as={percent_16} />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 