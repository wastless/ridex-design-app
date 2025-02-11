/*** Рендеринг текста ***/

import { useMutation } from "@liveblocks/react";
import { useEffect, useRef, useState } from "react";
import { TextLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Text({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const {
    x,
    y,
    width,
    height,
    text,
    fontSize,
    fill,
    stroke,
    opacity,
    fontFamily,
    fontWeight,
  } = layer;

  const [isEditing, setIsEditing] = useState(false); // Отслеживает, редактируется ли текст
  const [inputValue, setInputValue] = useState(text); // Содержит текущее значение текста
  const inputRef = useRef<HTMLInputElement>(null); // Ссылка на поле ввода

  // Обновление текста в хранилище
  const updateText = useMutation(
    ({ storage }, newText: string) => {
      const liveLayers = storage.get("layers"); // Получаем слои из хранилища
      const layer = liveLayers.get(id); // Находим слой по id
      if (layer) {
        layer.update({ text: newText }); // Обновляем текст
      }
    },
    [id],
  );

  // Автофокус при редактировании текста
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Обработчик двойного клика
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // Обработчик изменения текста
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Обработчик потери фокуса
  const handleBlur = () => {
    setIsEditing(false);
    updateText(inputValue);
  };

  // Обработчик нажатия клавиши Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      updateText(inputValue);
    }
  };

  return (
    <g className="group" onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        // Если текст редактируется, рендерим поле ввода
        <foreignObject x={x} y={y} width={width} height={height}>
          <input
            ref={inputRef} // Присваиваем ссылку на поле ввода
            type="text"
            value={inputValue} // Отображаем текущее значение текста
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              fontSize: `${fontSize}px`,
              color: colorToCss(fill),
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
            }}
          />
        </foreignObject>
      ) : (
        // Если текст не редактируется, рендерим обычный текст
        <>
          {/*Прямоугольник-рамка, обозначающий границы текста*/}
          <rect
            style={{ transform: `translate(${x}px, ${y}px)` }}
            width={width}
            height={height}
            fill="none"
            stroke="#4183ff"
            strokeWidth="2"
            className="pointer-events-none opacity-0 group-hover:opacity-100"
          />
          {/*Текстовый слой*/}
          <text
            onPointerDown={(e) => onPointerDown(e, id)}
            x={x}
            y={y + fontSize}
            fontSize={fontSize}
            fill={colorToCss(fill)}
            stroke={colorToCss(stroke)}
            opacity={opacity}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
          >
            {text}
          </text>
        </>
      )}
    </g>
  );
}

