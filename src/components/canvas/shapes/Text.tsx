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
  const {
    x,
    y,
    width,
    height,
    text,
    fontSize,
    fill,
    opacity,
    fontFamily,
    fontWeight,
  } = layer;

  const [isEditing, setIsEditing] = useState(true);
  const [inputValue, setInputValue] = useState(text);
  const textRef = useRef<HTMLDivElement>(null);

  const updateText = useMutation(
    ({ storage }, newText: string, newWidth: number) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        layer.update({ text: newText, width: newWidth });
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

  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const cursorOffset = range ? range.startOffset : null; // Запоминаем позицию курсора

    const newText = e.currentTarget.innerText;
    setInputValue(newText);

    if (textRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const metrics = context.measureText(newText);
        const newWidth = Math.max(metrics.width, 10);
        updateText(newText, newWidth);
      }
    }

    // Восстанавливаем позицию курсора (если пользователь её не менял, курсор уже в конце)
    setTimeout(() => {
      if (textRef.current && selection) {
        const range = document.createRange();
        const position = cursorOffset ?? textRef.current.innerText.length; // Если offset null, ставим в конец
        range.setStart(textRef.current.firstChild ?? textRef.current, position);
        range.setEnd(textRef.current.firstChild ?? textRef.current, position);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setInputValue(inputValue);
  };

  return (
    <g className="group" onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <>
          <rect
            style={{ transform: `translate(${x}px, ${y}px)` }}
            width={width}
            height={height}
            fill="none"
            stroke="#4183ff"
            strokeWidth="2"
            className="pointer-events-none opacity-100 transition-opacity"
          />
          <foreignObject x={x} y={y} width={width} height={height}>
            <div
              ref={textRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleChange}
              onBlur={handleBlur}
              spellCheck={false}
              autoCorrect="off"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
                color: colorToCss(fill),
                minWidth: "10px",
                whiteSpace: "pre",
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
          {!isEditing && (
            <line
              x1={x}
              y1={y + fontSize + 2}
              x2={x + width}
              y2={y + fontSize + 2}
              stroke="#4183FF"
              strokeWidth="2"
              className="opacity-0 transition-opacity group-hover:opacity-100"
            />
          )}

          {/* Сам текст */}
          <text
            onPointerDown={(e) => onPointerDown(e, id)}
            x={x}
            y={y + fontSize}
            fontSize={fontSize}
            fill={colorToCss(fill)}
            opacity={opacity}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            style={{ userSelect: "none" }}
          >
            {text}
          </text>
        </>
      )}
    </g>
  );
}
