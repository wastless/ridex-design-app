'use client';

import React, { useState } from 'react';
import { colorToCss, hexToRgb } from '~/utils';
import { Color as ColorType } from '~/types';
import { Color as ColorPicker } from './Color';
import { useCanvas } from '~/components/canvas/helper/CanvasContext';

interface BgColorProps {
  roomColor: ColorType | null;
  setRoomColor: (color: ColorType) => void;
}

export default function BgColor({ roomColor, setRoomColor }: BgColorProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const { history } = useCanvas();

  // Handle color picker open/close
  const handleColorPickerOpenChange = (open: boolean) => {
    setIsColorPickerOpen(open);
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
      <div className="flex flex-row items-center justify-between">
        <div className="flex w-full flex-row gap-1.5">
          <div className="flex-1 min-w-0">
            <ColorPicker
              value={roomColor ? colorToCss(roomColor) : "#F5F5F5"}
              onChange={(color) => {
                const rgbColor = hexToRgb(color);
                setRoomColor({ ...rgbColor, a: 255 });
              }}
              className="w-full h-8"
              onOpenChange={handleColorPickerOpenChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 