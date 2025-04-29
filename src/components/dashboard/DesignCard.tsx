"use client";

/**
 * Компонент карточки дизайна
 *
 * Отображает превью дизайна и его основную информацию в виде карточки.
 * Позволяет взаимодействовать с дизайном: открывать, переименовывать, удалять и т.д.
 */

import type { Room } from "@prisma/client";
import { useState, useEffect, useRef, useCallback } from "react";
import { updateRoomTitle, deleteRoom } from "~/app/actions/rooms";
import {
  file_remove,
  file_rename,
  open_file,
  open_file_new_tab,
  preview_design,
} from "~/icon";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import * as Dropdown from "~/components/ui/dropdown";
import * as Divider from "~/components/ui/divider";

/**
 * Цветовые пары для превью дизайнов
 * Каждая пара содержит цвет фона и цвет элементов превью
 */
const COLOR_PAIRS = [
  { bg: "bg-neutral-50", preview: "text-neutral-200" }, // нейтральный
  { bg: "bg-blue-50", preview: "text-blue-200" }, // синий
  { bg: "bg-purple-50", preview: "text-purple-200" }, // фиолетовый
  { bg: "bg-orange-50", preview: "text-orange-200" }, // оранжевый
  { bg: "bg-red-50", preview: "text-red-200" }, // красный
  { bg: "bg-green-50", preview: "text-green-200" }, // зеленый
  { bg: "bg-yellow-50", preview: "text-yellow-200" }, // желтый
  { bg: "bg-sky-50", preview: "text-sky-200" }, // небо
  { bg: "bg-pink-50", preview: "text-pink-200" }, // розовый
  { bg: "bg-teal-50", preview: "text-teal-200" }, // зеленый
];

/**
 * Компонент превью дизайна
 * Отображает стилизованную иконку дизайна с определенной цветовой схемой
 *
 * @param {Object} props - Свойства компонента
 * @param {number} props.colorIndex - Индекс цветовой пары для отображения
 */
function DesignPreview({ colorIndex }: { colorIndex: number }) {
  const colorPair = COLOR_PAIRS[Math.abs(colorIndex) % COLOR_PAIRS.length]!;

  return (
    <div className={`relative h-full w-full ${colorPair.bg}`}>
      <div className="absolute left-[16px] top-[32px]">
        <svg
          width="310"
          height="149"
          viewBox="0 0 310 149"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={colorPair.preview}
        >
          <path
            d="M0.921875 4.66296C0.921875 2.45382 2.71274 0.662964 4.92188 0.662964H96.9219C99.131 0.662964 100.922 2.45382 100.922 4.66296V24.663C100.922 26.8721 99.131 28.663 96.9219 28.663H4.92188C2.71274 28.663 0.921875 26.8721 0.921875 24.663V4.66296Z"
            fill="currentColor"
          />
          <path
            d="M4.92188 36.663C2.71274 36.663 0.921875 38.4538 0.921875 40.663V46.663C0.921875 48.8721 2.71274 50.663 4.92188 50.663H96.9219C99.131 50.663 100.922 48.8721 100.922 46.663V40.663C100.922 38.4538 99.131 36.663 96.9219 36.663H4.92188Z"
            fill="currentColor"
          />
          <path
            d="M4.92188 101.663C2.71274 101.663 0.921875 103.454 0.921875 105.663V111.663C0.921875 113.872 2.71274 115.663 4.92187 115.663H46.9219C49.131 115.663 50.9219 113.872 50.9219 111.663V105.663C50.9219 103.454 49.131 101.663 46.9219 101.663H4.92188Z"
            fill="currentColor"
          />
          <path
            d="M257.672 0.673499H309.677C309.025 3.12148 307.741 5.35316 305.956 7.14297L219.469 93.8425C218.648 94.6652 218.03 95.6691 217.663 96.7741C217.338 97.7545 217.134 98.8446 217.649 99.7388C218.691 101.545 221.173 102.688 223.064 103.001C229.278 104.025 236.427 103.616 243.664 103.202C245.552 103.094 247.446 102.986 249.331 102.903C261.17 102.379 271.87 108.287 280.314 116.642L308.232 144.266C308.526 144.557 308.738 144.922 308.845 145.322C309.255 146.859 308.045 148.349 306.462 148.298C300.445 148.103 294.37 148.355 288.306 148.606C282.262 148.856 276.23 149.106 270.28 148.912C270.004 148.903 269.725 148.895 269.441 148.886C265.077 148.75 259.914 148.59 256.086 146.875C250.496 144.368 242.738 135.569 235.101 126.907C228.813 119.776 222.607 112.737 217.758 109.377C213.902 106.706 209.248 105.714 205.108 108.3C202.347 110.442 197.376 115.728 191.679 121.786C180.531 133.639 166.603 148.448 161.013 148.448H114.597C113.453 148.448 112.436 147.715 112.068 146.626C111.783 145.779 111.911 144.869 112.487 144.188C117.451 138.318 132.587 123.639 149.137 107.589C174.709 82.7885 203.657 54.7144 203.669 50.8078C203.669 49.6043 203.385 48.4853 202.608 47.5352C201.872 46.6273 200.958 46.3001 199.855 46.0889C195.021 45.168 187.963 45.5627 180.63 45.9727C174.496 46.3156 168.17 46.6693 162.792 46.2727C155.915 45.7656 150.527 41.0467 145.589 36.2094C142.005 32.6973 138.137 29.1938 134.26 25.6825C126.309 18.4808 118.322 11.2467 112.672 3.84054C111.324 2.0633 112.666 0.662964 114.89 0.662964H163.114C163.902 0.662964 166.938 2.57374 167.884 3.25993C173.683 7.46617 179.495 14.1503 185.317 20.8464C191.215 27.6286 197.123 34.4231 203.039 38.6675C207.788 42.0773 211.465 43.1752 216.697 39.7337C222.533 35.9013 228.939 28.5919 235.356 21.2711C240.976 14.8588 246.603 8.43777 251.862 4.33671C252.808 3.60829 257.126 0.673499 257.672 0.673499Z"
            fill="currentColor"
          />
          <path
            d="M309.677 0.673499H309.678C309.679 0.673499 309.68 0.672948 309.68 0.672269C309.68 0.670831 309.678 0.670561 309.677 0.671949L309.677 0.673499Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Компонент карточки дизайна
 *
 * @param {Object} props - Свойства компонента
 * @param {Room} props.room - Объект комнаты/дизайна
 * @param {boolean} props.selected - Флаг выбора карточки
 * @param {Function} props.onSelect - Функция обработки выбора карточки
 * @param {Function} props.onNavigate - Функция навигации к дизайну
 * @param {boolean} props.canEdit - Флаг возможности редактирования
 */
export default function DesignCard({
  room,
  selected,
  onSelect,
  onNavigate,
}: {
  room: Room;
  selected: boolean;
  onSelect: () => void;
  onNavigate: () => void;
}) {
  // Состояние для измененного названия
  const [editedTitle, setEditedTitle] = useState(room.title);
  // Состояние для позиции контекстного меню
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  // Таймаут для отслеживания одинарного/двойного клика
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  // Состояние для режима переименования
  const [isRenaming, setIsRenaming] = useState(false);
  // Ссылка на поле ввода
  const inputRef = useRef<HTMLInputElement>(null);
  // Ссылка на таймаут обновления
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Генерируем фиксированный индекс цвета на основе ID комнаты
  const colorIndex =
    room.id.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0) % COLOR_PAIRS.length;

  // Обработчик нажатия клавиши Backspace для показа модального окна подтверждения удаления
  const handleDelete = useCallback(async () => {
    try {
      await deleteRoom(room.id);
      handleCloseContextMenu();
    } catch (error) {
      console.error("Ошибка удаления комнаты:", error);
      // Здесь можно добавить показ сообщения об ошибке пользователю
    }
  }, [room.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && selected && !isRenaming) {
        e.preventDefault();
        void handleDelete();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected, isRenaming, handleDelete]);

  /**
   * Обработчик клика по карточке
   * Определяет одинарный или двойной клик
   */
  const handleClick = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Обрабатываем только левый клик

    if (clickTimeout) {
      // Обнаружен двойной клик
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      onNavigate();
    } else {
      // Одинарный клик - ждем, чтобы убедиться, что это не двойной клик
      const timeout = setTimeout(() => {
        setClickTimeout(null);
        onSelect();
      }, 250); // 250мс - стандартный порог для двойного клика
      setClickTimeout(timeout);
    }
  };

  /**
   * Обработчик контекстного меню (правый клик)
   */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  /**
   * Закрытие контекстного меню
   */
  const handleCloseContextMenu = () => {
    setContextMenuPosition(null);
  };

  // Очистка таймаута при размонтировании компонента
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  /**
   * Начало процесса переименования
   */
  const handleRename = () => {
    setIsRenaming(true);
    setEditedTitle(room.title);
  };

  /**
   * Подтверждение переименования и сохранение нового названия
   */
  const handleRenameSubmit = () => {
    if (editedTitle.trim() && editedTitle !== room.title) {
      // Отменяем предыдущий таймаут, если он существует
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Устанавливаем новый таймаут для дебаунсинга
      updateTimeoutRef.current = setTimeout(() => {
        void updateRoomTitle(editedTitle, room.id).catch((error) => {
          console.error("Ошибка обновления названия:", error);
          // Восстанавливаем предыдущее значение в случае ошибки
          setEditedTitle(room.title);
        });
      }, 500); // Задержка 500мс
    }
    setIsRenaming(false);
  };

  /**
   * Отмена переименования
   */
  const handleRenameCancel = () => {
    // Отменяем таймаут обновления, если он существует
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    setIsRenaming(false);
    setEditedTitle(room.title);
  };

  /**
   * Обработчик нажатия клавиш при редактировании названия
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  // Автоматически выделяем текст в поле ввода при начале переименования
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      // Даем время на рендер input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isRenaming]);

  /**
   * Открытие дизайна в новом окне
   */
  const handleOpenInNewWindow = () => {
    window.open(`/dashboard/${room.id}`, "_blank");
    handleCloseContextMenu();
  };

  // Очищаем таймаут при размонтировании компонента
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Секция превью */}
        <div
          onContextMenu={handleContextMenu}
          onClick={handleClick}
          className={`shadow-regular-m border-1 flex h-[180px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-stroke-soft-200 ${selected ? "outline outline-2 outline-primary-base" : ""}`}
        >
          <DesignPreview colorIndex={colorIndex} />
        </div>

        {/* Текстовая секция с информацией */}
        <div
          onContextMenu={handleContextMenu}
          onClick={handleClick}
          className="flex flex-row items-center gap-4"
        >
          <div className="h-5 w-5">{preview_design({})}</div>

          <div className="flex w-full flex-col gap-0">
            <div
              className={`${isRenaming ? "w-full rounded-sm bg-bg-weak-50 text-paragraph-sm text-text-strong-950" : ""} h-5`}
            >
              {isRenaming ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleRenameSubmit}
                  className="w-full bg-transparent text-paragraph-sm text-text-strong-950 outline-none"
                />
              ) : (
                <p className="select-none text-paragraph-sm text-text-strong-950">
                  {room.title}
                </p>
              )}
            </div>
            <p className="select-none text-paragraph-xs text-text-soft-400">
              {formatDistanceToNow(room.createdAt, {
                addSuffix: true,
                locale: ru,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Контекстное меню */}
      {contextMenuPosition && (
        <Dropdown.Root open={true} onOpenChange={handleCloseContextMenu}>
          <Dropdown.Content
            style={{
              width: "240px",
              position: "fixed",
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
            }}
            align="start"
            sideOffset={5}
            alignOffset={5}
          >
            <Dropdown.Item onClick={onNavigate}>
              <Dropdown.ItemIcon as={open_file} />
              Открыть
            </Dropdown.Item>
            <Dropdown.Item onClick={handleOpenInNewWindow}>
              <Dropdown.ItemIcon as={open_file_new_tab} />
              Открыть в новом окне
            </Dropdown.Item>

            <Divider.Root variant="line-spacing" />

            <Dropdown.Item onClick={handleRename}>
              <Dropdown.ItemIcon as={file_rename} />
              Переименовать
            </Dropdown.Item>
            <Dropdown.Item onClick={handleDelete}>
              <Dropdown.ItemIcon as={file_remove} />
              Удалить
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
      )}
    </>
  );
}
