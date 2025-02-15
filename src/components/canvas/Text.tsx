import { useMutation } from "@liveblocks/react";
import { useEffect, useRef, useState } from "react";
import {CanvasMode, TextLayer} from "~/types";
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
  } = layer;

  const [isEditing, setIsEditing] = useState(false); // Track if the text is being edited
  const [inputValue, setInputValue] = useState(text); // Store the current value of the text
  const inputRef = useRef<HTMLInputElement>(null); // Reference to the input field

  const outlineClass = canvasMode === CanvasMode.Translating
      ? "pointer-events-none opacity-0"
      : "pointer-events-none opacity-0 group-hover:opacity-100";

  // Update text in storage
  const updateText = useMutation(
      ({ storage }, newText: string) => {
        const liveLayers = storage.get("layers"); // Get layers from storage
        const layer = liveLayers.get(id); // Find layer by id
        if (layer) {
          layer.update({ text: newText }); // Update text
        }
      },
      [id],
  );

  // Autofocus when editing text
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle double click to edit
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle blur event
  const handleBlur = () => {
    setIsEditing(false);
    updateText(inputValue);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      updateText(inputValue);
    }
  };

  return (
      <g className="group" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
            // Render input field if editing
            <foreignObject x={x} y={y} width={width} height={height}>
              <input
                  ref={inputRef} // Assign reference to input field
                  type="text"
                  value={inputValue} // Display current text value
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
            // Render normal text if not editing
            <>
              {/* Rectangle frame indicating text boundaries */}
              <rect
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  width={width}
                  height={height}
                  fill="none"
                  stroke="#4183ff"
                  strokeWidth="2"
                  className={outlineClass}
              />
              {/* Text layer */}
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
              >
                {text}
              </text>
            </>
        )}
      </g>
  );
}