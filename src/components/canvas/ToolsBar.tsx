/*** Рендеринг панели инструментов ***/
import { CanvasMode, CanvasState, LayerType } from "~/types";
import { ToolbarDropdownShape } from "~/components/ui/toolbar-dropdown-shape";
import { ToolbarDropdownSelection } from "~/components/ui/toolbar-dropdown-selection";
import React, { useEffect } from "react";
import * as ToolbarButton from "~/components/ui/toolbar-button";
import { glass_minus, glass_plus, pencil, text } from "~/icon";

export default function ToolsBar({
  canvasState,
  setCanvasState,
  zoomIn,
  zoomOut,
}: {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] flex -translate-x-1/2 items-center justify-center rounded-lg bg-bg-white-0 p-2">
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

        {/*Кнопка добавления фрейма*/}

        {/*Выпадающий список фигур*/}
        <ToolbarDropdownShape
          canvasState={canvasState}
          isActiveAction={(value) =>
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === value
          }
          onSelectAction={(layerType) => {
            if (
              layerType === LayerType.Rectangle ||
              layerType === LayerType.Ellipse
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

        {/*Кнопка таблицы*/}

        {/*Кнопка импорта*/}

        <div className="flex items-center justify-center">
          <ToolbarButton.Root onClick={zoomIn}>
            <ToolbarButton.Icon as={glass_plus} />
          </ToolbarButton.Root>
          <ToolbarButton.Root onClick={zoomOut}>
            <ToolbarButton.Icon as={glass_minus} />
          </ToolbarButton.Root>
        </div>
      </div>
    </div>
  );
}