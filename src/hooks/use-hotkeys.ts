"use client";

/**
 * Хук для работы с горячими клавишами в редакторе
 * Обрабатывает клавиатурные сочетания для различных действий - выделение, удаление, копирование и т.д.
 */

import { useEffect } from "react";
import { CanvasMode, LayerType, CanvasState } from "~/types";
import { Camera } from "~/types";
import { Dispatch, SetStateAction } from "react";
import useDeleteLayers from "~/hooks/use-delete-layers";
import useClipboard from "~/hooks/use-clipboard";
import { useHistory, useMutation } from "@liveblocks/react";

/**
 * Хук для обработки горячих клавиш в редакторе
 *
 * @param setState - Функция установки состояния холста
 * @param setCamera - Функция управления камерой (позиция, масштаб)
 * @param leftIsMinimized - Текущее состояние левой панели (свернута/развернута)
 * @param setLeftIsMinimized - Функция для изменения состояния левой панели
 */
export const useHotkeys = (
  setState: Dispatch<SetStateAction<CanvasState>>,
  setCamera: (updater: (prev: Camera) => Camera) => void,
  leftIsMinimized: boolean,
  setLeftIsMinimized: (value: boolean) => void,
) => {
  const deleteLayers = useDeleteLayers();
  const { copy, cut, paste } = useClipboard();
  const history = useHistory();

  // Функция выделения всех слоев
  const selectAllLayers = useMutation(({ storage, setMyPresence }) => {
    const layerIds = storage.get("layerIds");
    if (layerIds) {
      setMyPresence({ selection: layerIds.toArray() }, { addToHistory: true });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Не обрабатываем горячие клавиши, если фокус находится в поле ввода текста
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Предотвращаем стандартное поведение для всех горячих клавиш
      e.preventDefault();

      switch (e.code) {
        case "KeyA":
          // Ctrl+A: Выделить все слои
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectAllLayers();
          }
          break;
        case "Delete":
        case "Backspace":
          // Delete/Backspace: Удалить выделенные слои
          deleteLayers();
          break;
        case "KeyZ":
          // Ctrl+Z: Отменить действие, Ctrl+Shift+Z: Повторить действие
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              history.redo();
            } else {
              history.undo();
            }
          }
          break;
        case "KeyY":
          // Ctrl+Y: Повторить действие
          if (e.ctrlKey || e.metaKey) {
            history.redo();
          }
          break;
        case "KeyC":
          // Ctrl+C: Копировать выделенные слои
          if (e.ctrlKey || e.metaKey) {
            copy();
          }
          break;
        case "KeyX":
          // Ctrl+X: Вырезать выделенные слои
          if (e.ctrlKey || e.metaKey) {
            cut();
          }
          break;
        case "KeyV":
          // Ctrl+V: Вставить слои из буфера обмена
          if (e.ctrlKey || e.metaKey) {
            paste();
          } else {
            // V: Сбросить режим инструмента
            setState({ mode: CanvasMode.None });
          }
          break;
        case "KeyR":
          // R: Включить инструмент "Прямоугольник"
          if (!e.ctrlKey && !e.metaKey) {
            setState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            });
          }
          break;
        case "KeyO":
          // O: Включить инструмент "Эллипс"
          if (!e.ctrlKey && !e.metaKey) {
            setState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            });
          }
          break;
        case "KeyT":
          // T: Включить инструмент "Текст"
          if (!e.ctrlKey && !e.metaKey) {
            setState({ mode: CanvasMode.Inserting, layerType: LayerType.Text });
          }
          break;
        case "KeyP":
          // P: Включить инструмент "Карандаш"
          if (!e.ctrlKey && !e.metaKey) {
            setState({ mode: CanvasMode.Pencil });
          }
          break;
        case "KeyH":
          // H: Включить инструмент "Рука" (перемещение холста)
          if (!e.ctrlKey && !e.metaKey) {
            setState({ mode: CanvasMode.Dragging, origin: null });
          }
          break;
        case "BracketLeft":
          // [: Свернуть/развернуть левую панель
          if (!e.ctrlKey && !e.metaKey) {
            setLeftIsMinimized(!leftIsMinimized);
          }
          break;
        case "Equal":
        case "NumpadAdd":
          // Ctrl++: Увеличить масштаб
          if (e.ctrlKey || e.metaKey) {
            setCamera((prev) => ({
              ...prev,
              zoom: Math.min(prev.zoom * 1.2, 10),
            }));
          }
          break;
        case "Minus":
        case "NumpadSubtract":
          // Ctrl+-: Уменьшить масштаб
          if (e.ctrlKey || e.metaKey) {
            setCamera((prev) => ({
              ...prev,
              zoom: Math.max(prev.zoom / 1.2, 0.02),
            }));
          }
          break;
        case "Digit0":
        case "Numpad0":
          // Ctrl+0: Сбросить масштаб на 100%
          if (e.ctrlKey || e.metaKey) {
            setCamera((prev) => ({
              ...prev,
              zoom: 1,
            }));
          }
          break;
      }
    };

    // Добавляем обработчик событий с захватом, чтобы перехватывать клавиши первыми
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    setState,
    deleteLayers,
    copy,
    cut,
    paste,
    history,
    setCamera,
    leftIsMinimized,
    setLeftIsMinimized,
    selectAllLayers,
  ]);
};
