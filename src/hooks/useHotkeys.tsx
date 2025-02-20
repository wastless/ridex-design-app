import { Dispatch, SetStateAction, useEffect } from "react";
import { useHistory, useMutation, useStorage } from "@liveblocks/react";
import useDeleteLayers from "~/hooks/useDeleteLayers";
import { Camera, CanvasMode, CanvasState, LayerType } from "~/types";
import { zoomIn, zoomOut } from "~/utils/zoom";

// Хук для обработки горячих клавиш
export default function useHotkeys(
  setState: Dispatch<SetStateAction<CanvasState>>,
  setCamera: Dispatch<SetStateAction<Camera>>,
  leftIsMinimized: boolean,
  setLeftIsMinimized: Dispatch<SetStateAction<boolean>>,
) {
  const deleteLayers = useDeleteLayers(); // Функция удаления слоев
  const history = useHistory(); // История действий
  const layerIds = useStorage((root) => root.layerIds); // Получаем id слоев из хранилища

  // Функция выделения всех слоев
  const selectAllLayers = useMutation(
    ({ setMyPresence }) => {
      // Проверяем, есть ли слои для выделения
      if (layerIds) {
        setMyPresence({ selection: [...layerIds] }, { addToHistory: true }); // Выделяем все слои
      }
    },
    [layerIds],
  );

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Shift") {
      setState((prevState) => {
        if (prevState.mode === CanvasMode.CreatingShape) {
          return { ...prevState, isShiftPressed: true };
        }
        return prevState;
      });
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.key === "Shift") {
      setState((prevState) => {
        if (prevState.mode === CanvasMode.CreatingShape) {
          return { ...prevState, isShiftPressed: false };
        }
        return prevState;
      });
    }
  }

  useEffect(() => {
    // Обработчик событий с клавиатуры
    function onKeyDown(e: KeyboardEvent) {
      const activeElement = document.activeElement as HTMLElement; // Приводим к HTMLElement
      const isEditingText =
          activeElement && activeElement.isContentEditable; // Теперь ошибок не будет

      // Разрешаем стандартные Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
      if (e.ctrlKey || e.metaKey) {
        if (["KeyC", "KeyV", "KeyX", "KeyA"].includes(e.code)) {
          return;
        }
      }

      // Если редактируется текст, игнорируем остальные хоткеи
      if (isEditingText) return;

      // Режим работы со слоями
      switch (e.code) {
        case "KeyZ":
          if (e.ctrlKey || e.metaKey) {
            e.shiftKey ? history.redo() : history.undo();
            e.preventDefault();
          }
          break;

        case "Backspace":
        case "Delete":
          deleteLayers();
          break;

        case "KeyA":
          if (e.ctrlKey || e.metaKey) {
            selectAllLayers();
            e.preventDefault();
          }
          break;

        case "KeyV":
          setState({ mode: CanvasMode.None });
          break;

        case "KeyH":
          setState({ mode: CanvasMode.Dragging, origin: null });
          break;

        case "KeyR":
          setState({ mode: CanvasMode.Inserting, layerType: LayerType.Rectangle });
          break;

        case "KeyO":
          setState({ mode: CanvasMode.Inserting, layerType: LayerType.Ellipse });
          break;

        case "KeyT":
          setState({ mode: CanvasMode.Inserting, layerType: LayerType.Text });
          break;

        case "KeyP":
          setState({ mode: CanvasMode.Pencil });
          break;

        case "Equal":
          if (e.ctrlKey || e.metaKey) {
            zoomIn(setCamera);
            e.preventDefault();
          }
          break;

        case "Minus":
          if (e.ctrlKey || e.metaKey) {
            zoomOut(setCamera);
            e.preventDefault();
          }
          break;

        case "Backslash":
          if (e.ctrlKey || e.metaKey) {
            setLeftIsMinimized(!leftIsMinimized);
            e.preventDefault();
          }
          break;
      }
    }


    window.addEventListener("keydown", onKeyDown, { capture: true }); // Добавляем слушатель событий с клавиатуры с опцией capture
    window.addEventListener("keyup", onKeyUp, { capture: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.removeEventListener("keyup", onKeyUp, { capture: true });
    }; // Удаляем слушатель событий с клавиатуры
  }, [
    deleteLayers,
    history,
    selectAllLayers,
    layerIds,
    setState,
    setCamera,
    leftIsMinimized,
    setLeftIsMinimized,
  ]);
}