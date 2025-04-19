import { useMutation } from "@liveblocks/react";
import React, { useEffect, useRef, useState } from "react";
import { CanvasMode, type TextLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Text({
  id,
  layer,
  onPointerDown,
  setIsEditingText,
  canvasMode,
}: {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  setIsEditingText: (isEditing: boolean) => void;
  canvasMode: CanvasMode;
}) {
  const {
    x,
    y,
    width,
    height,
    text,
    fontSize,
    fontWeight,
    fontFamily,
    lineHeight,
    fill,
    stroke,
    opacity = 100,
    blendMode,
    letterSpacing,
  } = layer;

  // Получаем CSS-представление цветов с учетом их непрозрачности
  const fillColor = fill ? colorToCss(fill) : undefined;
  const strokeColor = stroke ? colorToCss(stroke) : undefined;

  const [isEditing, setIsEditing] = useState(text === "");
  const [inputValue, setInputValue] = useState(text);
  const [textWidth, setTextWidth] = useState(layer.width || 10);
  const [textHeight, setTextHeight] = useState(layer.height || fontSize);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Check if the current canvas mode should show the underline
  const shouldShowUnderline = [
    CanvasMode.None,
    CanvasMode.RightClick,
    CanvasMode.SelectionNet,
    CanvasMode.Translating,
    CanvasMode.Pressing
  ].includes(canvasMode);

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

  // Update text dimensions when text properties change
  useEffect(() => {
    if (!isEditing) {
      const { width, height } = calculateTextDimensions(inputValue);
      setTextWidth(width);
      setTextHeight(height);
      updateText(inputValue, width, height);
    }
  }, [fontSize, fontWeight, fontFamily, lineHeight, letterSpacing, inputValue, isEditing]);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      setHasStartedTyping(false);
      textRef.current.select();
      
      // Log DOM measurements when entering edit mode
      const textarea = textRef.current;
      const rect = textarea.getBoundingClientRect();
      console.log('Entering edit mode - DOM measurements:', {
        textarea: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          fontSize: window.getComputedStyle(textarea).fontSize,
          lineHeight: window.getComputedStyle(textarea).lineHeight,
          padding: window.getComputedStyle(textarea).padding,
          margin: window.getComputedStyle(textarea).margin
        }
      });
    }
    setIsEditingText(isEditing);
  }, [isEditing, setIsEditingText]);

  // Add effect to log measurements when text changes
  useEffect(() => {
    if (textRef.current) {
      const textarea = textRef.current;
      const rect = textarea.getBoundingClientRect();
      console.log('Text content changed - DOM measurements:', {
        textarea: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          scrollHeight: textarea.scrollHeight,
          scrollWidth: textarea.scrollWidth,
          value: textarea.value,
          lines: textarea.value.split('\n').length
        }
      });
    }
  }, [inputValue]);

  const handleDoubleClick = () => {
    console.log('Before edit mode:', {
      position: { x, y },
      dimensions: { width: textWidth, height: textHeight },
      fontSize,
      lineHeight,
      text: inputValue
    });
    setIsEditing(true);
  };

  // Calculate text dimensions once and cache the result
  const calculateTextDimensions = (text: string) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      
      // Получаем метрики для расчета максимальной высоты строки
      const metrics = context.measureText('ÁÀÂÄÃÅĀĂĄÇĆČĈĊĎĐÉÈÊËĒĔĖĘĚĜĞĠĢĤĦÍÌÎÏĨĪĬĮİĲĴĶĹĻĽĿŁÑŃŅŇŊÓÒÔÖÕŌŎŐƠŒŔŖŘŚŜŞŠŢŤŦÚÙÛÜŨŪŬŮŰŲƯŴÝŸŶŹŻŽ');
      
      // В Figma высота строки (line-height) рассчитывается от максимально возможной высоты глифов
      const maxGlyphHeight = Math.max(
        metrics.actualBoundingBoxAscent,
        metrics.fontBoundingBoxAscent
      ) + Math.max(
        metrics.actualBoundingBoxDescent,
        metrics.fontBoundingBoxDescent
      );

      // Детальные логи метрик текста
      console.log('Детальные метрики текста (Figma style):', {
        font: context.font,
        metrics: {
          maxGlyphHeight,
          actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
          actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
          fontBoundingBoxAscent: metrics.fontBoundingBoxAscent,
          fontBoundingBoxDescent: metrics.fontBoundingBoxDescent,
        },
        settings: {
          fontSize,
          lineHeight,
          fontWeight,
          fontFamily,
        }
      });

      const lines = text.split("\n");
      const lineWidths = lines.map(line => context.measureText(line).width);
      const maxWidth = Math.max(...lineWidths, 10);
      
      const lineCount = lines.length;
      // Используем максимальную высоту глифов для расчета высоты строки
      const newHeight = Math.max(
        Math.ceil(lineCount * maxGlyphHeight * lineHeight),
        maxGlyphHeight
      );
      
      return { width: maxWidth, height: newHeight, lineWidths };
    }
    
    return { width: 10, height: fontSize, lineWidths: [10] };
  };

  // Update text size in the canvas
  const updateTextSize = (newText: string) => {
    const { width, height } = calculateTextDimensions(newText);
    console.log('Updating text size:', {
      oldSize: { width: textWidth, height: textHeight },
      newSize: { width, height }
    });
    setTextWidth(width);
    setTextHeight(height);
    updateText(newText, width, height);
  };

  // Handle text input
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputValue(newText);
    
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }
    
    // Calculate dimensions based on content
    const { width, height } = calculateTextDimensions(newText);
    setTextWidth(width);
    setTextHeight(height);
    updateText(newText, width, height);
  };

  // Update textarea height when entering edit mode
  useEffect(() => {
    if (isEditing && textRef.current) {
      const textarea = textRef.current;
      const { height } = calculateTextDimensions(inputValue);
      
      // Set explicit height and ensure no extra spacing
      textarea.style.height = `${height}px`;
      textarea.style.padding = '0';
      textarea.style.margin = '0';
      textarea.style.boxSizing = 'border-box';
      textarea.style.display = 'block';
      
      // Расширенные логи для отслеживания позиционирования
      const computedStyle = window.getComputedStyle(textarea);
      const rect = textarea.getBoundingClientRect();
      
      console.log('Детальные метрики textarea:', {
        // Размеры
        dimensions: {
          scrollHeight: textarea.scrollHeight,
          clientHeight: textarea.clientHeight,
          offsetHeight: textarea.offsetHeight,
          boundingHeight: rect.height,
        },
        // Отступы и границы
        spacing: {
          padding: computedStyle.padding,
          margin: computedStyle.margin,
          border: computedStyle.border,
          boxSizing: computedStyle.boxSizing,
        },
        // Позиционирование текста
        textMetrics: {
          lineHeight: computedStyle.lineHeight,
          fontSize: computedStyle.fontSize,
          verticalAlign: computedStyle.verticalAlign,
          alignItems: computedStyle.alignItems,
          display: computedStyle.display,
          position: computedStyle.position,
          top: computedStyle.top,
          transform: computedStyle.transform,
        },
        // Прокрутка
        scroll: {
          scrollTop: textarea.scrollTop,
          scrollLeft: textarea.scrollLeft,
        },
        // Позиция элемента
        position: {
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
        }
      });
      
      textarea.focus();
      setHasStartedTyping(false);
      textarea.select();
    }
    setIsEditingText(isEditing);
  }, [isEditing, setIsEditingText]);

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
    const isEmpty = !inputValue || (inputValue.trim() === "" && !inputValue.includes("\n"));
    
    // Log measurements when exiting edit mode
    if (textRef.current) {
      const textarea = textRef.current;
      const rect = textarea.getBoundingClientRect();
      console.log('Exiting edit mode - DOM measurements:', {
        textarea: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          scrollHeight: textarea.scrollHeight,
          scrollWidth: textarea.scrollWidth,
          value: textarea.value,
          lines: textarea.value.split('\n').length
        }
      });
    }
    
    if (isEmpty) {
      removeLayer();
    } else {
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

          <foreignObject 
            x={x} 
            y={y} 
            width={textWidth} 
            height={textHeight}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                padding: 0,
                margin: 0,
                display: 'flex',
                alignItems: 'flex-start'
              }}
            >
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
                  color: fillColor || '#000000',
                  minWidth: "10px",
                  whiteSpace: "pre",
                  overflowWrap: "break-word",
                  outline: "none",
                  background: "transparent",
                  letterSpacing: `${letterSpacing}px`,
                  width: "100%",
                  height: `${textHeight}px`,
                  display: "block",
                  direction: "ltr",
                  unicodeBidi: "plaintext",
                  resize: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  overflow: "hidden",
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  boxSizing: 'border-box',
                  lineHeight: 'normal' // Используем нормальную высоту строки
                }}
              />
            </div>
          </foreignObject>
        </>
      ) : (
        <>
          {getTextLines(inputValue).map((line, index) => {
            const lineY = y + (index * textHeight / getTextLines(inputValue).length);
            return (
              <text
                key={index}
                dominantBaseline="text-before-edge"
                textAnchor="start"
                onPointerDown={(e) => onPointerDown(e, id)}
                x={x}
                y={lineY}
                fontSize={fontSize}
                fill={fillColor || '#000000'}
                stroke={strokeColor}
                strokeWidth={stroke ? "1" : "0"}
                opacity={opacity}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
                style={{
                  userSelect: "none",
                  whiteSpace: "pre",
                  overflowWrap: "break-word",
                  mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'] || 'normal',
                  opacity: `${opacity ?? 100}%`,
                  letterSpacing: `${letterSpacing}px`,
                  lineHeight: 'normal' // Используем нормальную высоту строки
                }}
              >
                {line}
              </text>
            );
          })}
          
          {/* Underline that appears on hover */}
          {isHovering && shouldShowUnderline && getTextLines(inputValue).map((line, index) => {
            const lineWidths = getLineWidths();
            const lineWidth = lineWidths[index] || 10;
            const lineY = y + (index * textHeight / getTextLines(inputValue).length);
            
            // Skip empty lines (line breaks)
            if (line.trim() === "" && lineWidth <= 10) {
              return null;
            }
            
            return (
              <line
                key={`underline-${index}`}
                x1={x}
                y1={lineY + fontSize}
                x2={x + lineWidth}
                y2={lineY + fontSize}
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