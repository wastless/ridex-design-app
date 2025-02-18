import { useMutation } from "@liveblocks/react";
import { useEffect, useRef, useState } from "react";
import { CanvasMode, TextLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Text({
  id,
  layer,
  onPointerDown,
  canvasMode,
}: {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  canvasMode: CanvasMode;
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
    overflow,
  } = layer;

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputWidth, setInputWidth] = useState(width);
  const [inputHeight, setInputHeight] = useState(height);

  const outlineClass =
    canvasMode === CanvasMode.Translating
      ? "pointer-events-none opacity-0"
      : "pointer-events-none opacity-0 group-hover:opacity-100";

  const updateText = useMutation(
    ({ storage }, newText: string) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        layer.update({ text: newText });
      }
    },
    [id],
  );

  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) {
        inputRef.current.focus();
        adjustInputSize();
      } else if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInputValue(e.target.value);
    adjustInputSize();
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateText(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      updateText(inputValue);
    }
  };

  const adjustInputSize = () => {
    if (inputRef.current) {
      setInputWidth(inputRef.current.scrollWidth);
    }
  };

  return (
    <g className="group" onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <foreignObject x={x} y={y} width={inputWidth} height={inputHeight}>
          {width === 0 && height === 0 ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={{
                fontSize: `${fontSize}px`,
                color: colorToCss(fill),
                width: "100%",
                padding: "4px",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={{
                fontSize: `${fontSize}px`,
                color: colorToCss(fill),
                width: "100%",
                height: "100%",
                padding: "4px",
                border: "none",
                outline: "none",
                background: "transparent",
                resize: "none",
                overflow: "hidden",
              }}
            />
          )}
        </foreignObject>
      ) : (
        <>
          <rect
            style={{ transform: `translate(${x}px, ${y}px)` }}
            width={width}
            height={height}
            fill="none"
            stroke="#4183ff"
            strokeWidth="2"
            className={outlineClass}
          />
          <text
            onPointerDown={(e) => onPointerDown(e, id)}
            x={x}
            y={y + fontSize}
            fontSize={fontSize}
            fill={colorToCss(fill)}
            stroke={stroke ? colorToCss(stroke) : "none"}
            opacity={opacity}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            className="select-none"
            style={{
              overflow: "visible",
              whiteSpace: overflow === "visible" ? "pre" : "pre-wrap",
            }}
          >
            {text}
          </text>
        </>
      )}
    </g>
  );
}