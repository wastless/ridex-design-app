"use client";

/**
 * Компонент для отображения и редактирования текстовых слоев на холсте
 * Поддерживает форматирование текста, интерактивное редактирование и изменение размеров
 */

import { useMutation } from "@liveblocks/react";
import React, { useEffect, useRef, useState } from "react";
import { CanvasMode, type TextLayer } from "~/types";
import { colorToCss } from "~/utils";
import { useCanvas } from "../helper/CanvasContext";

// Константы для текстового слоя
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_LINE_HEIGHT_COEFFICIENT = 1.2;

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
  // Получаем camera для масштабирования обводки
  const { camera } = useCanvas();

  // Деструктурируем свойства слоя
  const {
    x,
    y,
    text,
    fontSize = DEFAULT_FONT_SIZE,
    fontWeight,
    fontFamily,
    lineHeight = DEFAULT_LINE_HEIGHT_COEFFICIENT,
    fill,
    stroke,
    opacity = 100,
    blendMode,
    letterSpacing,
  } = layer;

  // Получаем CSS-представление цветов с учетом их непрозрачности
  const fillColor = fill ? colorToCss(fill) : undefined;
  const strokeColor = stroke ? colorToCss(stroke) : undefined;

  // Толщина обводки с учетом масштаба
  const scaledStrokeWidth = stroke ? 1 / camera.zoom : 0;
  // Толщина обводки для выделения/наведения
  const outlineStrokeWidth = 3 / camera.zoom;

  // Состояния компонента
  const [isEditing, setIsEditing] = useState(text === "");
  const [inputValue, setInputValue] = useState(text);
  const [textWidth, setTextWidth] = useState(layer.width ?? 10);
  const [textHeight, setTextHeight] = useState(
    layer.height ?? DEFAULT_FONT_SIZE * DEFAULT_LINE_HEIGHT_COEFFICIENT,
  );
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Вычисляем актуальный интерлиньяж в пикселях
  const lineHeightInPixels = Math.round(fontSize * lineHeight);

  // Проверяем, нужно ли показывать подчеркивание в текущем режиме холста
  const shouldShowUnderline = [
    CanvasMode.None,
    CanvasMode.RightClick,
    CanvasMode.SelectionNet,
    CanvasMode.Translating,
    CanvasMode.Pressing,
  ].includes(canvasMode);

  // Стиль подчеркивания для выделения с учетом масштаба
  const underlineStyle = shouldShowUnderline
    ? {
        stroke: "#4183ff",
        strokeWidth: outlineStrokeWidth,
      }
    : undefined;

  // Мутация для обновления текста в хранилище
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

  // Расчет размеров текста с использованием canvas
  const calculateTextDimensions = (text: string) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

      // Получаем метрики для расчета максимальной высоты строки
      const lines = text.split("\n");
      const lineWidths = lines.map((line) => context.measureText(line).width);
      const maxWidth = Math.max(...lineWidths, 10);

      const lineCount = lines.length;
      // Используем lineHeightInPixels для расчета высоты контейнера
      const newHeight = Math.max(
        lineCount * lineHeightInPixels,
        lineHeightInPixels,
      );

      return { width: maxWidth, height: newHeight, lineWidths };
    }

    return { width: 10, height: lineHeightInPixels, lineWidths: [10] };
  };

  // Обновление размеров текста при изменении свойств
  useEffect(() => {
    if (!isEditing) {
      const { width, height } = calculateTextDimensions(inputValue);
      setTextWidth(width);
      setTextHeight(height);
      updateText(inputValue, width, height);
    }
  }, [
    fontSize,
    fontWeight,
    fontFamily,
    lineHeight,
    letterSpacing,
    inputValue,
    isEditing,
    updateText
  ]);

  // Фокус на текстовом поле при входе в режим редактирования
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      setHasStartedTyping(false);
      textRef.current.select();
    }
    setIsEditingText(isEditing);
  }, [isEditing, setIsEditingText]);

  // Обновление высоты textarea при входе в режим редактирования
  useEffect(() => {
    if (isEditing && textRef.current) {
      const textarea = textRef.current;
      const { height } = calculateTextDimensions(inputValue);

      // Set explicit height and ensure no extra spacing
      textarea.style.height = `${height}px`;
      textarea.style.padding = "0";
      textarea.style.margin = "0";
      textarea.style.boxSizing = "border-box";
      textarea.style.display = "block";
    }
  }, [isEditing, inputValue]);

  // Обработчик двойного клика для входа в режим редактирования
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // Обновление размера текста в холсте
  const updateTextSize = (newText: string) => {
    const { width, height } = calculateTextDimensions(newText);
    setTextWidth(width);
    setTextHeight(height);
    updateText(newText, width, height);
  };

  // Обработчик ввода текста
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputValue(newText);

    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }

    // Расчет размеров на основе содержимого
    const { width, height } = calculateTextDimensions(newText);
    setTextWidth(width);
    setTextHeight(height);
    updateText(newText, width, height);
  };

  // Обработчик нажатия клавиш
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      // Разрешаем Enter для создания переносов строк
      if (e.ctrlKey) {
        e.preventDefault();
        setIsEditing(false);
      }
    }
  };

  // Удаление слоя, если текст пустой
  const removeLayer = useMutation(
    ({ storage }) => {
      storage.get("layers").delete(id);
    },
    [id],
  );

  // Обработчик потери фокуса
  const handleBlur = () => {
    const isEmpty =
      !inputValue || (inputValue.trim() === "" && !inputValue.includes("\n"));

    if (isEmpty) {
      removeLayer();
    } else {
      updateTextSize(inputValue);
    }
    setIsEditing(false);
  };

  // Получение строк текста для отображения
  const getTextLines = (text: string) => {
    // Разделение по переносам строк с сохранением пустых строк
    return text.split("\n");
  };

  // Получение ширины строк для подчеркивания
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
              strokeWidth={outlineStrokeWidth}
              className="pointer-events-none opacity-100 transition-opacity"
            />
          )}

          <foreignObject x={x} y={y} width={textWidth} height={textHeight}>
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                padding: 0,
                margin: 0,
                display: "flex",
                alignItems: "flex-start",
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
                  color: fillColor ?? "#000000",
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
                  position: "absolute",
                  top: 0,
                  left: 0,
                  boxSizing: "border-box",
                  lineHeight: `${lineHeightInPixels}px`,
                  verticalAlign: "top",
                  textAlign: "left",
                  fontKerning: "auto",
                  fontFeatureSettings: "normal",
                  fontVariantLigatures: "normal",
                  fontVariantNumeric: "normal",
                  fontVariantEastAsian: "normal",
                  fontVariantAlternates: "normal",
                  fontVariantPosition: "normal",
                  fontStretch: "normal",
                  fontStyle: "normal",
                  fontVariant: "normal",
                  fontOpticalSizing: "auto",
                  fontVariationSettings: "normal",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  overflowY: "hidden",
                  overflowX: "hidden",
                  textIndent: "0",
                  WebkitTapHighlightColor: "transparent",
                  WebkitTextSizeAdjust: "none",
                  MozTextSizeAdjust: "none",
                  textSizeAdjust: "none",
                  MozPaddingStart: "0",
                  MozPaddingEnd: "0",
                  WebkitPaddingStart: "0",
                  WebkitPaddingEnd: "0",
                }}
              />
            </div>
          </foreignObject>
        </>
      ) : (
        <>
          {getTextLines(inputValue).map((line, index) => {
            const lineY = y + index * lineHeightInPixels;
            return (
              <text
                key={index}
                dominantBaseline="text-before-edge"
                textAnchor="start"
                onPointerDown={(e) => onPointerDown(e, id)}
                x={x}
                y={lineY}
                fontSize={fontSize}
                fill={fillColor ?? "#000000"}
                stroke={strokeColor}
                strokeWidth={scaledStrokeWidth}
                opacity={opacity}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
                style={{
                  userSelect: "none",
                  whiteSpace: "pre",
                  overflowWrap: "break-word",
                  mixBlendMode:
                    (blendMode as React.CSSProperties["mixBlendMode"]) ??
                    "normal",
                  opacity: `${opacity ?? 100}%`,
                  letterSpacing: `${letterSpacing}px`,
                  lineHeight: `${lineHeightInPixels}px`,
                }}
              >
                {line}
              </text>
            );
          })}

          {/* Подчеркивание, появляющееся при наведении */}
          {isHovering &&
            shouldShowUnderline &&
            getTextLines(inputValue).map((line, index) => {
              const lineWidths = getLineWidths();
              const lineWidth = lineWidths[index] ?? 10;
              const lineY = y + index * lineHeightInPixels;

              // Пропускаем пустые строки (переносы строк)
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
                  strokeWidth={outlineStrokeWidth}
                  className="pointer-events-none"
                  style={underlineStyle}
                />
              );
            })}
        </>
      )}
    </g>
  );
}