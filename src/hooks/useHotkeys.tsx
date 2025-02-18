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
      const activeElement = document.activeElement;

      // Проверяем, находится ли фокус в текстовом поле
      const isInputField =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA");

      if (isInputField) return; // Если фокус в текстовом поле, игнорируем событие

      // Отмена и повтор действий
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        if (e.shiftKey) {
          history.redo(); // Ctrl + Shift + Z (повтор действия)
        } else {
          history.undo(); // Ctrl + Z (отмена действия)
        }
        e.preventDefault();
        return;
      }

      switch (e.code) {
        case "ShiftLeft":
        case "ShiftRight":
          setState((prevState) => {
            if (
              prevState.mode === CanvasMode.CreatingShape &&
              !prevState.isShiftPressed
            ) {
              return { ...prevState, isShiftPressed: true };
            }
            return prevState;
          });
          break;

        // Удаление выделенных слоев
        case "Backspace":
        case "Delete":
          deleteLayers(); // Backspace или Delete (удалить слои)
          break;

        // Выделение всех слоев
        case "KeyA":
          if (e.ctrlKey || e.metaKey) {
            selectAllLayers(); // Ctrl + A (выделить все слои)
            e.preventDefault();
          }
          break;

        // Инструменты
        case "KeyV":
          setState({ mode: CanvasMode.None }); // Инструмент выделение
          break;
        case "KeyH":
          setState({ mode: CanvasMode.Dragging, origin: null }); // Инструмент рука
          break;
        case "KeyR":
          setState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Rectangle,
          }); // Инструмент прямоугольник
          break;
        case "KeyO":
          setState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Ellipse,
          }); // Инструмент эллипс
          break;
        case "KeyT":
          setState({ mode: CanvasMode.Inserting, layerType: LayerType.Text }); // Инструмент текст
          break;
        case "KeyP":
          setState({ mode: CanvasMode.Pencil }); // Инструмент рисование
          break;

        // Масштабирование
        case "Equal":
          if (e.ctrlKey || e.metaKey) {
            zoomIn(setCamera); // Ctrl + = (увеличить зум)
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        case "Minus":
          if (e.ctrlKey || e.metaKey) {
            zoomOut(setCamera); // Ctrl + - (уменьшить зум)
            e.preventDefault();
            e.stopPropagation();
          }
          break;

        // Скрыть/Открыть UI
        case "Backslash":
          if (e.ctrlKey || e.metaKey) {
            setLeftIsMinimized(!leftIsMinimized); // Ctrl + \ (скрыть/открыть UI)
            e.preventDefault();
          }
          break;

        // Копировать, Вставить, Вырезать, Дублировать
        case "KeyC":
          if (e.ctrlKey || e.metaKey) {
            document.execCommand("copy"); // Ctrl + C (копировать)
            e.preventDefault();
          }
          break;
        case "KeyV":
          if (e.ctrlKey || e.metaKey) {
            document.execCommand("paste"); // Ctrl + V (вставить)
            e.preventDefault();
          }
          break;
        case "KeyX":
          if (e.ctrlKey || e.metaKey) {
            document.execCommand("cut"); // Ctrl + X (вырезать)
            e.preventDefault();
          }
          break;
        case "KeyD":
          if (e.ctrlKey || e.metaKey) {
            document.execCommand("duplicate"); // Ctrl + D (дублировать)
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