'use client';

import React from 'react';
import * as Input from '~/components/ui/tageditor';
import * as Select from '~/components/ui/select';
import { percent_16, style_16 } from '~/icon';
import * as Button from '~/components/ui/button';
import { blendModes } from '~/data/blend-modes';
import type { Layer } from '~/types';

interface OpacityRowProps {
  layer: Layer;
  onUpdateLayer: (updates: { opacity?: number; blendMode?: string }) => void;
}

export default function OpacityRow({ layer, onUpdateLayer }: OpacityRowProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Режим смешивания */}
      <div className="flex flex-row items-center justify-between">
        <span className="text-paragraph-sm text-text-strong-950">
          Режим смешивания
        </span>
        <Button.Root variant="neutral" mode="ghost" size="xsmall">
          <Button.Icon as={style_16} />
        </Button.Root>
      </div>

      <div className="flex flex-row items-center justify-between">
        <div className="flex w-full flex-row gap-1.5">
          <div className="flex-1 min-w-0">
            <Select.Root
              size="xsmall"
              value={layer.blendMode ?? "normal"}
              onValueChange={(value) =>
                onUpdateLayer({ blendMode: value })
              }
            >
              <Select.Trigger>
                <Select.Value defaultValue="normal" />
              </Select.Trigger>
              <Select.Content>
                {blendModes.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div className="w-[64px] flex-shrink-0">
            <Input.Root>
              <Input.Wrapper iconPosition="right">
                <Input.Input
                  type="number"
                  value={Math.round(layer.opacity)}
                  min={0}
                  max={100}
                  step="1"
                  onChange={(e) => {
                    const number = parseFloat(e.target.value);
                    if (!isNaN(number)) {
                      if (number > 100) {
                        onUpdateLayer({ opacity: 100 });
                      } else if (number < 0) {
                        onUpdateLayer({ opacity: 0 });
                      } else {
                        onUpdateLayer({ opacity: number });
                      }
                    }
                  }}
                />
                <Input.Icon as={percent_16} />
              </Input.Wrapper>
            </Input.Root>
          </div>
        </div>
      </div>
    </div>
  );
} 