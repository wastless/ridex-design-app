/*** Рендеринг панели инструментов ***/
import { CanvasMode, CanvasState, LayerType } from "~/types";
import { ToolbarDropdownShape } from "~/components/ui/toolbar-dropdown-shape";
import { ToolbarDropdownSelection } from "~/components/ui/toolbar-dropdown-selection";
import React, { useEffect, useRef, useState } from "react";
import * as ToolbarButton from "~/components/ui/toolbar-button";
import { frame, palette, pencil, text } from "~/icon";
import PaletteGenerator from "~/components/ui/palette-generator";

// Тип состояния для вставки изображения
interface InsertingImageState {
  mode: CanvasMode.Inserting;
  layerType: LayerType.Image;
  imageData: {
    url: string;
    width: number;
    height: number;
    aspectRatio: number;
  };
}

export default function ToolsBar({
  canvasState,
  setCanvasState,
}: {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
}) {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    // Обработчик для получения imageData из window
    const handleImageData = () => {
      if (window.imageData && 
          canvasState.mode === CanvasMode.Inserting) {
        
        // Проверяем состояние для вставки изображения
        const insertingState = canvasState as any;
        if (insertingState.layerType === LayerType.Image) {
          const newState: InsertingImageState = {
            mode: CanvasMode.Inserting,
            layerType: LayerType.Image,
            imageData: window.imageData
          };
          setCanvasState(newState);
          // Очищаем данные после использования
          window.imageData = undefined;
        }
      }
    };

    // Проверяем наличие imageData при изменении состояния
    handleImageData();

    // Добавляем обработчик события для окна
    window.addEventListener('storage', handleImageData);
    
    return () => {
      window.removeEventListener('storage', handleImageData);
    };
  }, [canvasState, setCanvasState]);

  return (
    <div className="fixed bottom-4 left-1/2 z-[50] flex -translate-x-1/2 items-center justify-center rounded-lg bg-bg-white-0 p-2">
      <div className="flex items-center justify-center gap-2">
        {/*Выпадающий список инструментов перемещения*/}
        <ToolbarDropdownSelection
          canvasMode={canvasState.mode}
          isActiveAction={(value) =>
            canvasState.mode === value ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing ||
            canvasState.mode === CanvasMode.Dragging
          }
          onSelectAction={(canvasMode) => {
            if (canvasMode === CanvasMode.Dragging) {
              setCanvasState({ mode: canvasMode, origin: null }); // Добавляем `origin`
            } else {
              setCanvasState({ mode: canvasMode } as CanvasState);
            }
          }}
        />

        {/*Кнопка добавления рамки (фрейма)*/}
        <ToolbarButton.Root
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            'layerType' in canvasState &&
            canvasState.layerType === LayerType.Frame
          }
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Frame,
            })
          }
        >
          <ToolbarButton.Icon as={frame} />
        </ToolbarButton.Root>

        {/*Выпадающий список фигур*/}
        <ToolbarDropdownShape
          canvasState={canvasState}
          isActiveAction={(value) =>
            canvasState.mode === CanvasMode.Inserting &&
            'layerType' in canvasState &&
            canvasState.layerType === value
          }
          onSelectAction={(layerType) => {
            if (
              layerType === LayerType.Rectangle ||
              layerType === LayerType.Ellipse ||
              layerType === LayerType.Image
            ) {
              setCanvasState({ mode: CanvasMode.Inserting, layerType });
            }
          }}
        />

        {/*Кнопка рисования карандашом*/}
        <ToolbarButton.Root
          isActive={canvasState.mode === CanvasMode.Pencil}
          onClick={() => setCanvasState({ mode: CanvasMode.Pencil })}
        >
          <ToolbarButton.Icon as={pencil} />
        </ToolbarButton.Root>

        {/*Кнопка добавления текста*/}
        <ToolbarButton.Root
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            'layerType' in canvasState &&
            canvasState.layerType === LayerType.Text
          }
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })
          }
        >
          <ToolbarButton.Icon as={text} />
        </ToolbarButton.Root>

        {/*Кнопка палитры*/}
        <div className="relative">
          <ToolbarButton.Root
            onClick={() => setIsPaletteOpen(true)}
          >
            <ToolbarButton.Icon as={palette} />
          </ToolbarButton.Root>
          <PaletteGenerator
            isOpen={isPaletteOpen}
            onOpenChange={setIsPaletteOpen}
          />
        </div>
      </div>
    </div>
  );
}
