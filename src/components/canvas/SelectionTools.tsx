import useSelectionBounds from "~/hooks/useSelectionBounds";
import { Camera, CanvasMode } from "~/types";
import { useMutation, useSelf } from "@liveblocks/react";
import { memo } from "react";
import * as Dropdown from "~/components/ui/dropdown";
import * as Kbd from "~/components/ui/kbd";
import * as React from "react";

function SelectionTools({
  camera,
  canvasMode,
}: {
  camera: Camera;
  canvasMode: CanvasMode;
}) {
  const selection = useSelf((me) => me.presence.selection);

  const bringToFront = useMutation(
    ({ storage }) => {
      const liveLayerIds = storage.get("layerIds");
      const indices: number[] = [];

      const arr = liveLayerIds.toArray();

      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];

        if (element !== undefined && selection?.includes(element)) {
          indices.push(i);
        }
      }

      for (let i = indices.length - 1; i >= 0; i--) {
        const element = indices[i];
        if (element !== undefined) {
          liveLayerIds.move(element, arr.length - 1 - (indices.length - 1 - i));
        }
      }
    },
    [selection],
  );

  const sendToBack = useMutation(
    ({ storage }) => {
      const liveLayerIds = storage.get("layerIds");
      const indices: number[] = [];

      const arr = liveLayerIds.toArray();

      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];

        if (element !== undefined && selection?.includes(element)) {
          indices.push(i);
        }
      }

      for (let i = 0; i < indices.length; i++) {
        const element = indices[i];
        if (element !== undefined) {
          liveLayerIds.move(element, i);
        }
      }
    },
    [selection],
  );

  const selectionBounds = useSelectionBounds();
  if (!selectionBounds) {
    return null;
  }

  const x =
    (selectionBounds.width / 2 + selectionBounds.x) * camera.zoom + camera.x;
  const y = selectionBounds.y * camera.zoom + camera.y;

  if (canvasMode !== CanvasMode.RightClick) return null;

  return (
    <Dropdown.Root open modal={false}>
      <Dropdown.Content
        align="start"
        sideOffset={0}
        className="absolute w-60"
        style={{
          transform: `translate(calc(${x}px - 50%), calc(${y - 8}px - 100%))`,
        }}
      >
        <Dropdown.Group className="flex flex-col gap-0">
          <Dropdown.Item onSelect={bringToFront} className="flex justify-between items-center">
            Переместить вперед
              <Kbd.Root>]</Kbd.Root>
          </Dropdown.Item>
          <Dropdown.Item onSelect={sendToBack} className="flex justify-between items-center">
            Переместить назад
              <Kbd.Root>[</Kbd.Root>
          </Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

export default memo(SelectionTools);
