import { useMutation } from "@liveblocks/react";
import React, { useEffect, useRef, useState } from "react";
import { type TextLayer } from "~/types";
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
    text,
    fontSize,
    fill,
    opacity,
    fontFamily,
    fontWeight,
    lineHeight,
  } = layer;

  const [isEditing, setIsEditing] = useState(text === "");
  const [inputValue, setInputValue] = useState(text);
  const [textWidth, setTextWidth] = useState(layer.width || 10);
  const [textHeight, setTextHeight] = useState(fontSize); // Initial height
  const textRef = useRef<HTMLDivElement>(null);

  const updateText = useMutation(
    ({ storage }, newText: string, newWidth: number, newHeight: number) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        layer.update({ text: newText, width: newWidth, height: newHeight }); // Update height
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

      // Measure the height of the textRef element directly
      const measuredHeight = textRef.current?.offsetHeight ?? fontSize;

      setTextWidth(maxWidth);
      setTextHeight(measuredHeight);
      updateText(newText, maxWidth, measuredHeight);
    }
  };

  const handleInput = () => {
    if (!textRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(textRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const cursorPosition = preCaretRange.toString().length; // Текущая позиция курсора

    const newText = textRef.current.innerHTML
        .replace(/<div><br><\/div>/g, "\n")
        .replace(/<div>/g, "\n")
        .replace(/<\/div>/g, "")
        .replace(/<br>/g, "\n")
        .replace(/&nbsp;/g, " ") // Заменяем неразрывные пробелы обратно в текст


    if (newText !== inputValue) {
      setInputValue(newText);
      updateTextSize(newText);
    }

    requestAnimationFrame(() => {
      if (!textRef.current) return;

      const newSelection = window.getSelection();
      if (!newSelection) return;

      const newRange = document.createRange();
      let node = textRef.current.firstChild;
      let pos = cursorPosition;

      while (node && pos > 0) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (pos <= node.textContent!.length) {
            newRange.setStart(node, pos);
            newRange.setEnd(node, pos);
            break;
          } else {
            pos -= node.textContent!.length;
          }
        }
        node = node.nextSibling;
      }

      newSelection.removeAllRanges();
      newSelection.addRange(newRange);
    });
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!textRef.current) return;

      document.execCommand("insertLineBreak"); // More accurate line break

      requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (selection) {
          selection.modify("move", "forward", "lineboundary"); // Move cursor down
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
                whiteSpace: "pre", // Preserve whitespace and new lines
                overflowWrap: "break-word", // Break long words
                outline: "none",
                background: "transparent",
                lineHeight: `${fontSize * lineHeight}px`,
                height: "auto",
                display: "inline-block",
                verticalAlign: "top",
                alignItems: "center",
              }}
            >
              {inputValue}
            </div>
          </foreignObject>
        </>
      ) : (
        <>
          <text
            dominantBaseline="text-before-edge"
            textAnchor="start"
            onPointerDown={(e) => onPointerDown(e, id)}
            x={x}
            y={y}
            fontSize={fontSize}
            fill={colorToCss(fill)}
            opacity={opacity}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            style={{ userSelect: "none", whiteSpace: "pre" }}
          >
            {text.split("\n").map((line, index) => (
              <tspan
                x={x}
                dy={index === 0 ? 0 : fontSize * lineHeight}
                key={index}
              >
                {line}
              </tspan>
            ))}
          </text>
        </>
      )}
    </g>
  );
}
