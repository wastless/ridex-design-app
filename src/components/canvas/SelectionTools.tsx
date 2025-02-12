import useSelectionBounds from "~/hooks/useSelectionBounds";
import { Camera, CanvasMode } from "~/types";
import { useMutation, useSelf } from "@liveblocks/react";
import { memo } from "react";

/** Компонент для инструментов работы с выделением **/
function SelectionTools({
  camera,
  canvasMode,
}: {
  camera: Camera;
  canvasMode: CanvasMode;
}) {
  // Получаем текущее выделение из состояния
  const selection = useSelf((me) => me.presence.selection);

  // Перемещение выделенных слоев вперед
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

  // Перемещение выделенных слоев назад
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

  // Получаем границы выделенной области
  const selectionBounds = useSelectionBounds();
  if (!selectionBounds) {
    return null;
  }

  // Вычисляем позицию для отображения инструментов в зависимости от камеры
  const x =
    (selectionBounds.width / 2 + selectionBounds.x) * camera.zoom + camera.x;
  const y = selectionBounds.y * camera.zoom + camera.y;

  // Показываем инструменты только в режиме правого клика
  if (canvasMode !== CanvasMode.RightClick) return null;

  return (
    <div
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y - 8}px - 100%))`,
      }}
      className="rounded-radius-sm border-greyscale-100 bg-greyscale-0 p-spacing-4 absolute box-border flex min-w-[210px] flex-col border-[1px] border-solid text-left"
    >
      {/* Кнопка для перемещения вперед */}
      <button
        onClick={bringToFront}
        className="rounded-radius-xs px-spacing-8 py-spacing-4 text-xs-medium text-greyscale-800 hover:bg-greyscale-50 flex w-full items-center justify-between"
      >
        <span>Переместить вперед</span>
        <span className="text-xs-medium text-base-text-paragraph ml-auto">
          ]
        </span>
      </button>

      {/* Кнопка для перемещения назад */}
      <button
        onClick={sendToBack}
        className="rounded-radius-xs px-spacing-8 py-spacing-4 text-xs-medium text-greyscale-800 hover:bg-greyscale-50 flex w-full items-center justify-between"
      >
        <span>Переместить назад</span>
        <span className="text-xs-medium text-base-text-paragraph ml-auto">
          [
        </span>
      </button>
    </div>
  );
}

export default memo(SelectionTools);
