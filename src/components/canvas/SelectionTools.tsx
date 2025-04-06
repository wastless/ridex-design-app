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

  const bringForward = useMutation(
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

      // Sort indices in descending order to move from bottom to top
      indices.sort((a, b) => b - a);

      for (const index of indices) {
        if (index < arr.length - 1) {
          liveLayerIds.move(index, index + 1);
        }
      }
    },
    [selection],
  );

  const sendBackward = useMutation(
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

      // Sort indices in ascending order to move from top to bottom
      indices.sort((a, b) => a - b);

      for (const index of indices) {
        if (index > 0) {
          liveLayerIds.move(index, index - 1);
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
          <Dropdown.Item
            onSelect={bringToFront}
            className="flex items-center justify-between"
          >
            На передний план
            <Kbd.Root>]</Kbd.Root>
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={bringForward}
            className="flex items-center justify-between"
          >
            Переместить вперед
            <Kbd.Root>Ctrl ]</Kbd.Root>
          </Dropdown.Item>

          <Dropdown.Item
            onSelect={sendToBack}
            className="flex items-center justify-between"
          >
            На задний план
            <Kbd.Root>[</Kbd.Root>
          </Dropdown.Item>

          <Dropdown.Item
            onSelect={sendBackward}
            className="flex items-center justify-between"
          >
            Переместить назад
            <Kbd.Root>Ctrl [</Kbd.Root>
          </Dropdown.Item>
          
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

export default memo(SelectionTools);
