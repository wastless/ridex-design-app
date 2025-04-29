"use client";

/**
 * Компонент для отображения контекстного меню выделенных элементов на холсте.
 * Позволяет управлять порядком слоев выделенных элементов (передний/задний план).
 */

import useSelectionBounds from "~/hooks/use-selection-bounds";
import { Camera, CanvasMode } from "~/types";
import { useMutation, useSelf } from "@liveblocks/react";
import { memo } from "react";
import * as Dropdown from "~/components/ui/dropdown";
import * as Kbd from "~/components/ui/kbd";

/**
 * Интерфейс пропсов компонента SelectionTools
 */
interface SelectionToolsProps {
  camera: Camera;
  canvasMode: CanvasMode;
}

/**
 * Компонент контекстного меню для управления выделенными элементами
 */
function SelectionTools({ camera, canvasMode }: SelectionToolsProps) {
  // Получаем ID выделенных элементов из хранилища Liveblocks
  const selection = useSelf((me) => me.presence.selection);

  /**
   * Мутация для перемещения выделенных элементов на передний план
   */
  const bringToFront = useMutation(
    ({ storage }) => {
      const liveLayerIds = storage.get("layerIds");
      const indices: number[] = [];
      const arr = liveLayerIds.toArray();

      // Находим индексы выделенных элементов
      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (element !== undefined && selection?.includes(element)) {
          indices.push(i);
        }
      }

      // Перемещаем элементы на передний план (в конец массива)
      for (let i = indices.length - 1; i >= 0; i--) {
        const element = indices[i];
        if (element !== undefined) {
          liveLayerIds.move(element, arr.length - 1 - (indices.length - 1 - i));
        }
      }
    },
    [selection],
  );

  /**
   * Мутация для перемещения выделенных элементов на задний план
   */
  const sendToBack = useMutation(
    ({ storage }) => {
      const liveLayerIds = storage.get("layerIds");
      const indices: number[] = [];
      const arr = liveLayerIds.toArray();

      // Находим индексы выделенных элементов
      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (element !== undefined && selection?.includes(element)) {
          indices.push(i);
        }
      }

      // Перемещаем элементы на задний план (в начало массива)
      for (let i = 0; i < indices.length; i++) {
        const element = indices[i];
        if (element !== undefined) {
          liveLayerIds.move(element, i);
        }
      }
    },
    [selection],
  );

  /**
   * Мутация для перемещения выделенных элементов на один слой вперед
   */
  const bringForward = useMutation(
    ({ storage }) => {
      const liveLayerIds = storage.get("layerIds");
      const indices: number[] = [];
      const arr = liveLayerIds.toArray();

      // Находим индексы выделенных элементов
      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (element !== undefined && selection?.includes(element)) {
          indices.push(i);
        }
      }

      // Сортируем индексы в порядке убывания для перемещения снизу вверх
      indices.sort((a, b) => b - a);

      // Перемещаем каждый элемент на одну позицию вперед
      for (const index of indices) {
        if (index < arr.length - 1) {
          liveLayerIds.move(index, index + 1);
        }
      }
    },
    [selection],
  );

  /**
   * Мутация для перемещения выделенных элементов на один слой назад
   */
  const sendBackward = useMutation(
    ({ storage }) => {
      const liveLayerIds = storage.get("layerIds");
      const indices: number[] = [];
      const arr = liveLayerIds.toArray();

      // Находим индексы выделенных элементов
      for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        if (element !== undefined && selection?.includes(element)) {
          indices.push(i);
        }
      }

      // Сортируем индексы в порядке возрастания для перемещения сверху вниз
      indices.sort((a, b) => a - b);

      // Перемещаем каждый элемент на одну позицию назад
      for (const index of indices) {
        if (index > 0) {
          liveLayerIds.move(index, index - 1);
        }
      }
    },
    [selection],
  );

  // Получаем границы выделения
  const selectionBounds = useSelectionBounds();
  if (!selectionBounds) {
    return null;
  }

  // Рассчитываем позицию для меню относительно выделения с учетом масштаба
  const x =
    (selectionBounds.width / 2 + selectionBounds.x) * camera.zoom + camera.x;
  const y = selectionBounds.y * camera.zoom + camera.y;

  // Отображаем меню только в режиме правого клика
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
