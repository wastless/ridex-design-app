import { useMutation } from "@liveblocks/react";
import { useEffect, useRef, useState } from "react";
import { TextLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Text({
  id,
  layer,
  onPointerDown,
  setIsEditingText,
}: {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  setIsEditingText: (isEditing: boolean) => void;
}) {
  const { x, y, text, fontSize, fill, opacity, fontFamily, fontWeight } = layer;

  const [isEditing, setIsEditing] = useState(text === "");
  const [inputValue, setInputValue] = useState(text);
  const [textWidth, setTextWidth] = useState(layer.width || 10);
  const [textHeight, setTextHeight] = useState(fontSize); // Начальная высота
  const textRef = useRef<HTMLDivElement>(null);

  const updateText = useMutation(
    ({ storage }, newText: string, newWidth: number, newHeight: number) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        layer.update({ text: newText, width: newWidth, height: newHeight }); // Обновляем height
      }
    },
    [id],
  );

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
    }
    setIsEditingText(isEditing);
  }, [isEditing, setIsEditingText]);

  const handleDoubleClick = () => {
    setIsEditing(true);

    requestIdleCallback(() => {
      if (textRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(textRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });
  };

  const updateTextSize = (newText: string) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

      const lines = newText.split("\n");
      const maxWidth = Math.max(
        ...lines.map((line) => context.measureText(line).width),
        10,
      );
      const newHeight = lines.length * fontSize;

      setTextWidth(maxWidth);
      setTextHeight(newHeight);
      updateText(newText, maxWidth, newHeight); // Теперь сохраняем и высоту
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!textRef.current) return;

    let newText = textRef.current.innerHTML
      .replace(/<div><br><\/div>/g, "\n") // Пустые строки → \n
      .replace(/<div>/g, "\n") // Новый div → новая строка
      .replace(/<\/div>/g, "") // Убираем </div>
      .replace(/<br>/g, "\n"); // Заменяем <br> на \n

    // 🔥 Добавляем проверку, изменился ли текст
    if (newText !== inputValue) {
      setInputValue(newText);
      updateTextSize(newText);
    }

    // Перемещаем курсор в конец текста
    requestAnimationFrame(() => {
      if (!textRef.current) return;

      const newRange = document.createRange();
      const newSelection = window.getSelection();

      newRange.selectNodeContents(textRef.current);
      newRange.collapse(false); // Курсор в конец

      newSelection?.removeAllRanges();
      newSelection?.addRange(newRange);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!textRef.current) return;

      document.execCommand("insertLineBreak"); // Более корректный перенос строки

      requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (selection) {
          selection.modify("move", "forward", "lineboundary"); // Перемещение курсора вниз
        }

        const newText = textRef.current?.innerText ?? "";
        setInputValue(newText);
        updateTextSize(newText);
      });
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <g className="group" onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <>
          <rect
            style={{ transform: `translate(${x}px, ${y}px)` }}
            width={textWidth}
            height={textHeight}
            fill="none"
            stroke="#4183ff"
            strokeWidth="2"
            className="pointer-events-none opacity-100 transition-opacity"
          />

          <foreignObject x={x} y={y} width={textWidth} height={textHeight}>
            <div
              ref={textRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              spellCheck={false}
              autoCorrect="off"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
                color: colorToCss(fill),
                minWidth: "10px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                outline: "none",
                background: "transparent",
              }}
            >
              {inputValue}
            </div>
          </foreignObject>
        </>
      ) : (
        <>
          <text
            onPointerDown={(e) => onPointerDown(e, id)}
            x={x}
            y={y}
            fontSize={fontSize}
            fill={colorToCss(fill)}
            opacity={opacity}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            style={{ userSelect: "none" }}
          >
            {text.split("\n").map((line, index) => (
              <tspan x={x} dy={index === 0 ? fontSize : fontSize} key={index}>
                {line}
              </tspan>
            ))}
          </text>
        </>
      )}
    </g>
  );
}
