"use client";

import React, { useState, useEffect } from "react";
import * as Input from "~/components/ui/tageditor";
import * as Select from "~/components/ui/select";
import { Combobox } from "~/components/ui/combobox";
import { letter_spacing_16, line_height_16, style_16 } from "~/icon";
import * as Button from "~/components/ui/button";
import { googleFonts } from "~/data/fonts";
import { fontWeights, getWeightLabel } from "~/data/font-weights";
import type { LayerType } from "~/types";
import type { Layer } from "~/types";

// Constants
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_LINE_HEIGHT_COEFFICIENT = 1.2;

type TextLayer = Extract<Layer, { type: LayerType.Text }>;

interface TextRowProps {
  layer: TextLayer;
  onUpdateLayer: (updates: Partial<TextLayer>) => void;
}

const TextRow: React.FC<TextRowProps> = ({ layer, onUpdateLayer }) => {
  const [inputValue, setInputValue] = useState(layer?.fontFamily || "Inter");
  const [lineHeightValue, setLineHeightValue] = useState(
    layer?.lineHeight ?? DEFAULT_LINE_HEIGHT_COEFFICIENT
  );
  const [letterSpacingValue, setLetterSpacingValue] = useState(
    layer?.letterSpacing ?? 0
  );

  // Calculate line height in pixels for UI display
  const lineHeightInPixels = Math.round(
    (layer?.fontSize || DEFAULT_FONT_SIZE) * lineHeightValue
  );

  // Update local states when layer changes
  useEffect(() => {
    setLineHeightValue(layer?.lineHeight ?? DEFAULT_LINE_HEIGHT_COEFFICIENT);
    setLetterSpacingValue(layer?.letterSpacing ?? 0);
  }, [layer?.lineHeight, layer?.letterSpacing]);

  const handleValueChange = (value: string) => {
    setInputValue(value);
    // Set weight to Regular (400) if available, or first available weight
    const weights = fontWeights[value as keyof typeof fontWeights] || [400];
    const defaultWeight = weights.includes(400) ? 400 : weights[0];
    onUpdateLayer({
      fontFamily: value,
      fontWeight: defaultWeight,
    });
  };

  // Get available weights for current font
  const currentFontWeights = fontWeights[inputValue as keyof typeof fontWeights] || [400];

  return (
    <div className="flex flex-col gap-2">
      {/* Panel Header */}
      <div className="flex flex-row items-center justify-between">
        <span className="text-paragraph-sm text-text-strong-950">Текст</span>
        <Button.Root variant="neutral" mode="ghost" size="xsmall">
          <Button.Icon as={style_16} />
        </Button.Root>
      </div>

      {/* Font Family Selection */}
      <div className="flex flex-row items-center justify-between">
        <Combobox
          size="xsmall"
          value={inputValue}
          onValueChange={handleValueChange}
          items={googleFonts.map((font) => ({
            value: font.value,
            label: font.label,
          }))}
          fontFamily={inputValue}
          mode="select"
        />
      </div>

      <div className="flex flex-row items-center justify-between">
        <div className="flex w-full flex-row gap-1.5">
          {/* Font Size */}
          <div className="w-[88px] flex-shrink-0">
            <Combobox
              size="xsmall"
              value={String(layer?.fontSize || DEFAULT_FONT_SIZE)}
              onValueChange={(value) => onUpdateLayer({ fontSize: parseInt(value) })}
              items={[
                { value: "10", label: "10" },
                { value: "11", label: "11" },
                { value: "12", label: "12" },
                { value: "13", label: "13" },
                { value: "14", label: "14" },
                { value: "15", label: "15" },
                { value: "16", label: "16" },
                { value: "20", label: "20" },
                { value: "24", label: "24" },
                { value: "32", label: "32" },
                { value: "36", label: "36" },
                { value: "40", label: "40" },
                { value: "48", label: "48" },
                { value: "64", label: "64" },
                { value: "98", label: "98" },
                { value: "128", label: "128" },
              ]}
              mode="input"
            />
          </div>

          {/* Font Weight */}
          <div className="min-w-0 flex-1">
            <Select.Root
              size="xsmall"
              value={String(layer?.fontWeight || "400")}
              onValueChange={(value) => onUpdateLayer({ fontWeight: parseInt(value) })}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {currentFontWeights.map((weight) => (
                  <Select.Item key={weight} value={String(weight)}>
                    {getWeightLabel(weight)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </div>

      {/* Spacing Settings */}
      <div className="flex flex-row items-center justify-between">
        <span className="text-paragraph-sm text-text-strong-950">
          Интервалы
        </span>
        <div className="flex w-[154px] flex-row gap-1.5">
          {/* Line Height Input */}
          <Input.Root>
            <Input.Wrapper iconPosition="right">
              <Input.Input
                type="number"
                value={lineHeightInPixels}
                onChange={(e) => {
                  const pixelValue = parseInt(e.target.value);
                  if (pixelValue >= 0) {
                    const newLineHeightCoefficient =
                      pixelValue / (layer?.fontSize || DEFAULT_FONT_SIZE);
                    setLineHeightValue(newLineHeightCoefficient);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onUpdateLayer({
                      lineHeight: lineHeightValue,
                    });
                    e.currentTarget.blur();
                  }
                }}
                onBlur={() => {
                  onUpdateLayer({
                    lineHeight: lineHeightValue,
                  });
                }}
                min="0"
              />
              <Input.Icon as={line_height_16} />
            </Input.Wrapper>
          </Input.Root>

          {/* Letter Spacing Input */}
          <Input.Root>
            <Input.Wrapper iconPosition="right">
              <Input.Input
                type="number"
                step="0.1"
                value={letterSpacingValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setLetterSpacingValue(
                    value === "" ? 0 : parseFloat(value) || 0
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onUpdateLayer({ letterSpacing: letterSpacingValue });
                    e.currentTarget.blur();
                  }
                }}
                onBlur={() => {
                  onUpdateLayer({ letterSpacing: letterSpacingValue });
                }}
              />
              <Input.Icon as={letter_spacing_16} />
            </Input.Wrapper>
          </Input.Root>
        </div>
      </div>
    </div>
  );
};

export default TextRow;
