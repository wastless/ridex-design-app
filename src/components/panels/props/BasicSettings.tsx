'use client';

import React from 'react';
import * as Input from '~/components/ui/tageditor';
import { X_16, Y_16, H_16, W_16, radius_16 } from '~/icon';
import { LayerType } from '~/types';

interface BasicSettingsProps {
  layer: any; // Using any for now, but ideally should be properly typed
  onUpdateLayer: (updates: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    opacity?: number;
    cornerRadius?: number;
    fill?: string | null;
    stroke?: string;
    fontSize?: number;
    fontWeight?: number;
    fontFamily?: string;
    tiltAngle?: number;
    blendMode?: string;
  }) => void;
}

export default function BasicSettings({ layer, onUpdateLayer }: BasicSettingsProps) {
  return (
    <>

          {/* Положение */}
          <div className="flex flex-row items-center justify-between">
            <span className="text-paragraph-sm text-text-strong-950">
              Положение
            </span>
            <div className="flex w-[154px] flex-row gap-1.5">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={X_16} />
                  <Input.Input
                    type="number"
                    value={layer?.x ? Math.round(layer.x) : 0}
                    onChange={(e) => {
                      const number = parseInt(e.target.value);
                      if (!isNaN(number)) {
                        onUpdateLayer({ x: number });
                      }
                    }}
                  />
                </Input.Wrapper>
              </Input.Root>

              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={Y_16} />
                  <Input.Input
                    type="number"
                    value={layer?.y ? Math.round(layer.y) : 0}
                    onChange={(e) => {
                      const number = parseInt(e.target.value);
                      if (!isNaN(number)) {
                        onUpdateLayer({ y: number });
                      }
                    }}
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </div>

          {/* Размер */}
          <div className="flex flex-row items-center justify-between">
            <span className="text-paragraph-sm text-text-strong-950">
              Размер
            </span>
            <div className="flex w-[154px] flex-row gap-1.5">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={W_16} />
                  <Input.Input
                    type="number"
                    value={
                      layer?.width ? Math.round(layer.width) : 0
                    }
                    onChange={(e) => {
                      const number = parseInt(e.target.value);
                      if (
                        !isNaN(number) &&
                        layer?.type !== LayerType.Path
                      ) {
                        onUpdateLayer({ width: number });
                      }
                    }}
                    disabled={layer?.type === LayerType.Path}
                    className="w-[64px]"
                  />
                </Input.Wrapper>
              </Input.Root>

              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={H_16} />
                  <Input.Input
                    type="number"
                    value={
                      layer?.height
                        ? Math.round(layer.height)
                        : 0
                    }
                    onChange={(e) => {
                      const number = parseInt(e.target.value);
                      if (
                        !isNaN(number) &&
                        layer?.type !== LayerType.Path
                      ) {
                        onUpdateLayer({ height: number });
                      }
                    }}
                    disabled={layer?.type === LayerType.Path}
                    className="w-[64px]"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </div>

          {/* Радиус скругления */}
          <div className="flex flex-row items-center justify-between">
            <span className="text-paragraph-sm text-text-strong-950">
              Радиус
            </span>
            <div className="flex w-[154px] flex-row gap-1.5">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon as={radius_16} />
                  <Input.Input
                    type="number"
                    value={
                      layer?.type === LayerType.Rectangle
                        ? Math.round(layer?.cornerRadius ?? 0)
                        : 0
                    }
                    min={0}
                    max={100}
                    onChange={(e) => {
                      const number = parseInt(e.target.value);
                      if (
                        !isNaN(number) &&
                        layer?.type === LayerType.Rectangle
                      ) {
                        onUpdateLayer({ cornerRadius: number });
                      }
                    }}
                    disabled={layer?.type !== LayerType.Rectangle}
                    className="w-[64px]"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
          </div>
    </>
  );
} 