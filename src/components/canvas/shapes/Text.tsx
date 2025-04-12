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
    blendMode,
  } = layer;

  const [isEditing, setIsEditing] = useState(text === "");
  const [inputValue, setInputValue] = useState(text);
  const [textWidth, setTextWidth] = useState(layer.width || 10);
  const [textHeight, setTextHeight] = useState(layer.height || fontSize);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const { isFixedSize } = layer;

  const updateText = useMutation(
    ({ storage }, newText: string, newWidth: number, newHeight: number) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        layer.update({ text: newText, width: newWidth, height: newHeight });
      }
    },
    [id],
  );

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      // Reset typing state when starting to edit
      setHasStartedTyping(false);
      
      // Select all text when entering edit mode
      textRef.current.select();
    }
    setIsEditingText(isEditing);
  }, [isEditing, setIsEditingText]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // Calculate text dimensions once and cache the result
  const calculateTextDimensions = (text: string) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      
      // Calculate width based on actual text content
      const lines = text.split("\n");
      const lineWidths = lines.map(line => context.measureText(line).width);
      const maxWidth = Math.max(...lineWidths, 10); // Minimum width
      
      // Calculate height based on line count and line height
      const lineCount = lines.length;
      const newHeight = Math.max(
        lineCount * fontSize * lineHeight,
        fontSize // Minimum height
      );
      
      return { width: maxWidth, height: newHeight, lineWidths };
    }
    
    return { width: 10, height: fontSize, lineWidths: [10] };
  };

  // Update text size in the canvas
  const updateTextSize = (newText: string) => {
    const { width, height } = calculateTextDimensions(newText);
    setTextWidth(width);
    setTextHeight(height);
    updateText(newText, width, height);
  };

  // Handle text input
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputValue(newText);
    
    // Mark that typing has started
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }
    
    // Update text size
    updateTextSize(newText);
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      // Allow Enter key to create line breaks
      if (e.ctrlKey) {
        e.preventDefault();
        setIsEditing(false);
      }
    }
  };

  // Remove layer if text is empty
  const removeLayer = useMutation(
    ({ storage }) => {
      storage.get("layers").delete(id);
    },
    [id],
  );

  // Handle blur event
  const handleBlur = () => {
    // Check if text is completely empty (no characters and no line breaks)
    const isEmpty = !inputValue || (inputValue.trim() === "" && !inputValue.includes("\n"));
    
    if (isEmpty) {
      removeLayer();
    } else {
      // Final size update on blur
      updateTextSize(inputValue);
    }
    setIsEditing(false);
  };

  // Get text lines for display
  const getTextLines = (text: string) => {
    // Split by newlines and preserve empty lines
    return text.split("\n");
  };

  // Get line widths for underlines
  const getLineWidths = () => {
    const { lineWidths } = calculateTextDimensions(inputValue);
    return lineWidths;
  };

  return (
    <g 
      className="group" 
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isEditing ? (
        <>
          {hasStartedTyping && (
            <rect
              style={{ transform: `translate(${x}px, ${y}px)` }}
              width={textWidth}
              height={textHeight}
              fill="none"
              stroke="#4183ff"
              strokeWidth="2"
              className="pointer-events-none opacity-100 transition-opacity"
            />
          )}

          <foreignObject x={x} y={y} width={textWidth} height={textHeight}>
            <textarea
              ref={textRef}
              value={inputValue}
              onChange={handleInput}
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
                whiteSpace: "pre",
                overflowWrap: "break-word",
                outline: "none",
                background: "transparent",
                lineHeight: `${fontSize * lineHeight}px`,
                height: "100%",
                width: "100%",
                display: "block",
                verticalAlign: "top",
                alignItems: "center",
                direction: "ltr",
                unicodeBidi: "plaintext",
                resize: "none",
                border: "none",
                padding: 0,
                margin: 0,
                overflow: "hidden"
              }}
            />
          </foreignObject>
        </>
      ) : (
        <>
          {getTextLines(inputValue).map((line, index) => (
            <text
              key={index}
              dominantBaseline="text-before-edge"
              textAnchor="start"
              onPointerDown={(e) => onPointerDown(e, id)}
              x={x}
              y={y + (index * fontSize * lineHeight)}
              fontSize={fontSize}
              fill={colorToCss(fill)}
              opacity={opacity}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              style={{
                userSelect: "none",
                whiteSpace: "pre",
                overflowWrap: "break-word",
                mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'] || 'normal'
              }}
            >
              {line}
            </text>
          ))}
          
          {/* Underline that appears on hover */}
          {isHovering && getTextLines(inputValue).map((line, index) => {
            const lineWidths = getLineWidths();
            const lineWidth = lineWidths[index] || 10;
            
            // Skip empty lines (line breaks)
            if (line.trim() === "" && lineWidth <= 10) {
              return null;
            }
            
            return (
              <line
                key={`underline-${index}`}
                x1={x}
                y1={y + (index * fontSize * lineHeight) + fontSize}
                x2={x + lineWidth}
                y2={y + (index * fontSize * lineHeight) + fontSize}
                stroke="#1264FF"
                strokeWidth="2"
                className="pointer-events-none"
              />
            );
          })}
        </>
      )}
    </g>
  );
}