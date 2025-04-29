"use client";

import React, { useState, useEffect } from 'react';
import { PaletteGenerationMethod } from "~/types";
import type { PaletteColor } from "~/types";
import {
  generateRandomColor,
  generatePaletteWithMethod,
  exportPaletteAsImage,
  isDarkColor,
} from "~/utils";
import * as Modal from "~/components/ui/modal";
import * as Button from "~/components/ui/button";
import * as Dropdown from "~/components/ui/dropdown";
import * as CompactButton from "~/components/ui/compact-button";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "~/utils/cn";
import { Color as ColorPicker } from "~/components/panels/props/ColorToHex";
import { RiArrowDownSLine, RiRefreshLine } from "@remixicon/react";
import {
    locked_16,
    unlocked_16,
    copy_16,
    close_16,
    plus_16,
  } from "~/icon";

const DEFAULT_PALETTE_SIZE = 6;
const MIN_PALETTE_SIZE = 2;
const MAX_PALETTE_SIZE = 6;

type PaletteGeneratorProps = {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function PaletteGenerator({
  isOpen = false,
  onOpenChange,
}: PaletteGeneratorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [method, setMethod] = useState<PaletteGenerationMethod>(
    PaletteGenerationMethod.Auto,
  );
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  console.log("Active color index:", activeColorIndex); // Добавляем логирование для отладки

  // Синхронизируем внутреннее состояние с внешним
  useEffect(() => {
    setInternalIsOpen(isOpen);
  }, [isOpen]);

  // Вызываем внешний обработчик при изменении состояния
  const handleOpenChange = (open: boolean) => {
    setInternalIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  // Инициализация палитры при первом открытии
  useEffect(() => {
    if (internalIsOpen && (!palette.length || palette.length === 0)) {
      // Создаем начальную палитру из 6 случайных цветов
      const initialPalette: PaletteColor[] = Array.from(
        { length: DEFAULT_PALETTE_SIZE },
        () => ({
          hex: generateRandomColor(),
          locked: false,
        }),
      );
      setPalette(initialPalette);
    }
  }, [internalIsOpen, palette.length]);

  // Генерация новой палитры
  const generateNewPalette = () => {
    setPalette((current) => generatePaletteWithMethod(current, method));
  };

  // Переключение блокировки цвета
  const toggleLock = (index: number) => {
    setPalette((current) =>
      current.map((color, i) =>
        i === index ? { ...color, locked: !color.locked } : color,
      ),
    );
  };

  // Копирование HEX-кода в буфер обмена
  const copyHexToClipboard = (hex: string) => {
    navigator.clipboard
      .writeText(hex)
      .then(() => {
        // Можно добавить уведомление о копировании
      })
      .catch((err) => {
        console.error("Не удалось скопировать: ", err);
      });
  };

  // Обновление цвета палитры
  const updatePaletteColor = (newColor: string, index: number) => {
    // Если цвет имеет формат #RRGGBBAA (8 символов), обрезаем его до #RRGGBB (6 символов)
    let hexColor = newColor;
    if (newColor.startsWith('#') && newColor.length > 7) {
      hexColor = newColor.substring(0, 7); // Берем только первые 7 символов (#RRGGBB)
      console.log(`Обрезаем HEX-код с альфа-каналом: ${newColor} -> ${hexColor}`);
    }

    setPalette((current) =>
      current.map((item, i) =>
        i === index ? { ...item, hex: hexColor } : item,
      ),
    );
  };

  // Удаление цвета из палитры
  const removeColor = (index: number) => {
    if (palette.length <= MIN_PALETTE_SIZE) {
      return; // Не удаляем, если достигнуто минимальное количество
    }

    setPalette((current) => current.filter((_, i) => i !== index));
  };

  // Добавление нового цвета в палитру
  const addColor = () => {
    if (palette.length >= MAX_PALETTE_SIZE) {
      return; // Не добавляем, если достигнуто максимальное количество
    }

    setPalette((current) => [
      ...current,
      { hex: generateRandomColor(), locked: false },
    ]);
  };

  return (
    <>
      {!onOpenChange && (
        <Button.Root onClick={() => handleOpenChange(true)}></Button.Root>
      )}

      <Modal.Root open={internalIsOpen} onOpenChange={handleOpenChange}>
        <Modal.Content className="max-w-[600px]">
          <VisuallyHidden>
            <Modal.Title>Генератор палитры</Modal.Title>
          </VisuallyHidden>

          <Modal.Header title="Генератор палитры"></Modal.Header>

          <div className="mt-6 px-6">
            {/* Отображение цветов палитры */}
            <div className="flex h-[160px] w-full overflow-hidden rounded-lg">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="relative flex-1 transition-all"
                  style={{ backgroundColor: color.hex }}
                >
                  {/* Слой наведения с действиями */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center h-[120px] opacity-0 transition-opacity hover:opacity-100">
                    <div className="flex flex-col items-center gap-1.5 p-2">
                      <CompactButton.Root
                        variant="modifiable"
                        onClick={() => toggleLock(index)}
                        title={color.locked ? "Разблокировать" : "Закрепить"}
                        className={cn(
                          isDarkColor(color.hex) 
                            ? "text-text-white-0" 
                            : "text-text-strong-950"
                        )}
                      >
                        <CompactButton.Icon as={color.locked ? locked_16 : unlocked_16} />
                      </CompactButton.Root>
                      
                      <CompactButton.Root
                        variant="modifiable"
                        onClick={() => copyHexToClipboard(color.hex)}
                        title="Копировать"
                        className={cn(
                          isDarkColor(color.hex) 
                            ? "text-text-white-0" 
                            : "text-text-strong-950"
                        )}
                      >
                        <CompactButton.Icon as={copy_16} />
                      </CompactButton.Root>
                      
                      <CompactButton.Root
                        variant="modifiable"
                        fullRadius
                        onClick={() => removeColor(index)}
                        disabled={palette.length <= MIN_PALETTE_SIZE}
                        title="Удалить"
                        className={cn(
                          isDarkColor(color.hex) 
                            ? "text-text-white-0" 
                            : "text-text-strong-950",
                          palette.length <= MIN_PALETTE_SIZE ? "opacity-50 cursor-not-allowed" : ""
                        )}
                      >
                        <CompactButton.Icon as={close_16} />
                      </CompactButton.Root>
                    </div>
                  </div>

                  {/* HEX-код и ColorPicker */}
                  <ColorPicker
                    value={color.hex}
                    onChange={(newColor) => updatePaletteColor(newColor, index)}
                    forceOpen={activeColorIndex === index}
                    onOpenChange={(open) => {
                      console.log("ColorPicker onOpenChange:", {
                        open,
                        activeIndex: index,
                      });
                      if (!open) {
                        setActiveColorIndex(null);
                      }
                    }}
                    trigger={
                      <button
                        className={cn(
                          "text-sm absolute bottom-0 left-0 right-0 w-full cursor-pointer border-0 p-2 text-center font-semibold backdrop-blur-sm transition-opacity hover:opacity-100",
                          isDarkColor(color.hex)
                            ? "bg-black/20 text-white"
                            : "bg-white/20 text-black",
                          color.locked ? "opacity-100" : "opacity-60",
                        )}
                        onClick={(e) => {
                          // Останавливаем всплытие события
                          e.stopPropagation();
                          e.preventDefault();

                          console.log("Hex button click:", {
                            currentIndex: activeColorIndex,
                            clickedIndex: index,
                          });

                          // Если уже активен текущий цвет - закрываем его, иначе открываем
                          if (activeColorIndex === index) {
                            setActiveColorIndex(null);
                          } else {
                            setActiveColorIndex(index);
                          }
                        }}
                      >
                        {color.hex.toUpperCase()}

                      </button>
                    }
                  />
                </div>
              ))}
              {palette.length < MAX_PALETTE_SIZE && (
                <div
                  className="relative flex w-max-[92px] flex-1 cursor-pointer items-center justify-center bg-bg-weak-50 hover:bg-bg-soft-200 transition-all"
                  onClick={addColor}
                >
                  <div className="flex flex-col items-center justify-center">

                    <CompactButton.Root
                        variant="modifiable"
                        fullRadius
                        onClick={addColor}
                        title="Добавить"
                        className="text-gray-500"
                      >
                        <CompactButton.Icon as={plus_16} />
                      </CompactButton.Root>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Modal.Footer>
            <Dropdown.Root>
              <Dropdown.Trigger asChild>
                <Button.Root mode="stroke" className="relative z-50 gap-1">
                  {method}
                  <RiArrowDownSLine className="size-4" />
                </Button.Root>
              </Dropdown.Trigger>
              <Dropdown.Content className="relative w-54 z-[52]">
                <Dropdown.Group>
                  {Object.values(PaletteGenerationMethod).map((methodName) => (
                    <Dropdown.Item
                      key={methodName}
                      onClick={() => {
                        setMethod(methodName);
                        setPalette((current) =>
                          generatePaletteWithMethod(current, methodName),
                        );
                      }}
                      className="hover:bg-bg-weak-50 cursor-pointer"
                    >
                      {methodName}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Group>
              </Dropdown.Content>
            </Dropdown.Root>
            <div className="flex items-center gap-2">
              <Button.Root onClick={generateNewPalette} mode="lighter">
                Обновить
              </Button.Root>

              <Button.Root
                onClick={() => exportPaletteAsImage(palette)}
                mode="filled"
              >
                Сохранить
              </Button.Root>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

export default PaletteGenerator;
