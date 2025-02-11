import { CanvasMode, CanvasState, LayerType } from "~/types";
import { ToolbarDropdownShape } from "~/components/ui/toolbar-dropdown-shape";
import { ToolbarDropdownSelection } from "~/components/ui/toolbar-dropdown-selection";
import React from "react";
import * as ToolbarButton from "~/components/ui/toolbar-button";
import { cursor, ellipse, hand, pencil, rectangle, text, Undo, redo, glass_minus, glass_plus } from "~/icon";

const shapes = [
  {
    icon: rectangle,
    value: LayerType.Rectangle,
    label: "Прямоугольник",
    kbd: "R",
  },
  {
    icon: ellipse,
    value: LayerType.Ellipse,
    label: "Эллипс",
    kbd: "O",
  },
];

const selection = [
  {
    icon: cursor,
    value: CanvasMode.None,
    label: "Перемещение",
    kbd: "V",
  },
  {
    icon: hand,
    value: CanvasMode.Dragging,
    label: "Рука",
    kbd: "H",
  },
];

export default function ToolsBar({
  canvasState,
  setCanvasState,
}: {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;

}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] flex -translate-x-1/2 items-center justify-center rounded-lg bg-bg-white-0 p-2">
      <div className="flex items-center justify-center gap-2">
        <ToolbarDropdownSelection
          defaultValue={CanvasMode.None}
          items={selection}
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
              setCanvasState({ mode: canvasMode, origin: null });
            } else {
              setCanvasState({ mode: canvasMode } as CanvasState);
            }
          }}
        />

        <ToolbarDropdownShape
          defaultValue={LayerType.Rectangle}
          items={shapes}
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

        <ToolbarButton.Root
          isActive={canvasState.mode === CanvasMode.Pencil}
          onClick={() => setCanvasState({ mode: CanvasMode.Pencil })}
        >
          <ToolbarButton.Icon as={pencil} />
        </ToolbarButton.Root>

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
      </div>
    </div>
  );
}
