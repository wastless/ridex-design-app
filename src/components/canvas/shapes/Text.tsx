"use client";

/**
 * Компонент для отображения и редактирования текстовых слоев на холсте
 * Поддерживает форматирование текста, интерактивное редактирование и изменение размеров
 */

import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@liveblocks/react";
import { CanvasMode, type TextLayer } from "~/types";
import { colorToCss } from "~/utils";
import { useCanvas } from "../helper/CanvasContext";

// Константы для текстовых слоев
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_LINE_HEIGHT_COEFFICIENT = 1.2;

type TextProps = {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  setIsEditingText: (isEditing: boolean) => void;
  canvasMode: CanvasMode;
};

/**
 * Компонент для создания и редактирования текстовых слоев на холсте
 */
export default function Text({
  id,
  layer,
  onPointerDown,
  setIsEditingText,
  canvasMode,
}: TextProps) {
  // Получаем camera для масштабирования обводки
  const { camera } = useCanvas();

  // Деструктуризация свойств из объекта слоя
  const {
    x,
    y,
    width,
    height,
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

  // Получаем CSS-представление цветов
  const fillColor = fill ? colorToCss(fill) : undefined;
  const strokeColor = stroke ? colorToCss(stroke) : undefined;

  // Толщина обводки с учетом масштаба
  const scaledStrokeWidth = stroke ? 1 / camera.zoom : 0;
  // Толщина обводки для выделения/наведения
  const outlineStrokeWidth = 3 / camera.zoom;

  // Состояния для редактирования текста
  const [isEditing, setIsEditing] = useState(text === ""); // Начать редактирование если текст пустой
  const [inputValue, setInputValue] = useState(text);
  const [textWidth, setTextWidth] = useState(layer.width || 10);
  const [textHeight, setTextHeight] = useState(
    layer.height || DEFAULT_FONT_SIZE * DEFAULT_LINE_HEIGHT_COEFFICIENT,
  );
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Вычисляем актуальный интерлиньяж в пикселях
  const lineHeightInPixels = Math.round(fontSize * lineHeight);

  // Проверяем, должны ли мы показывать подчеркивание
  const shouldShowUnderline = [
    CanvasMode.None,
    CanvasMode.RightClick,
    CanvasMode.SelectionNet,
    CanvasMode.Translating,
    CanvasMode.Pressing,
  ].includes(canvasMode);

  // Стиль подчеркивания для выделения
  const underlineStyle = shouldShowUnderline
    ? {
        stroke: "#4183ff",
        strokeWidth: outlineStrokeWidth,
      }
    : undefined;

  /**
   * Мутация для обновления текста в хранилище
   */
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

  /**
   * Мутация для обновления интерлиньяжа
   */
  const updateLineHeight = useMutation(
    ({ storage }, newLineHeightInPixels: number) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        // Пересчитываем коэффициент интерлиньяжа
        const newLineHeightCoefficient = newLineHeightInPixels / fontSize;
        layer.update({ lineHeight: newLineHeightCoefficient });
      }
    },
    [id, fontSize],
  );

  /**
   * Вычисляет размеры текста на основе его содержимого и стилей
   */
  const calculateTextDimensions = (text: string) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

      // Получаем метрики для расчета максимальной высоты строки
      const metrics = context.measureText(
        "ÁÀÂÄÃÅĀĂĄÇĆČĈĊĎĐÉÈÊËĒĔĖĘĚĜĞĠĢĤĦÍÌÎÏĨĪĬĮİĲĴĶĹĻĽĿŁÑŃŅŇŊÓÒÔÖÕŌŎŐƠŒŔŖŘŚŜŞŠŢŤŦÚÙÛÜŨŪŬŮŰŲƯŴÝŸŶŹŻŽ",
      );

      const maxGlyphHeight =
        Math.max(
          metrics.actualBoundingBoxAscent,
          metrics.fontBoundingBoxAscent,
        ) +
        Math.max(
          metrics.actualBoundingBoxDescent,
          metrics.fontBoundingBoxDescent,
        );

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
    updateText,
  ]);

  // Управление фокусом и выделением при редактировании
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      setHasStartedTyping(false);
      textRef.current.select();
    }
    setIsEditingText(isEditing);
  }, [isEditing, setIsEditingText]);

  /**
   * Обработчик двойного клика для начала редактирования
   */
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  /**
   * Обновляет размеры текстового слоя в хранилище
   */
  const updateTextSize = (newText: string) => {
    const { width, height } = calculateTextDimensions(newText);
    setTextWidth(width);
    setTextHeight(height);
    updateText(newText, width, height);
  };

  /**
   * Обработчик ввода текста
   */
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputValue(newText);

    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }

    // Рассчитываем размеры на основе содержимого
    const { width, height } = calculateTextDimensions(newText);
    setTextWidth(width);
    setTextHeight(height);
    updateText(newText, width, height);
  };

  // Обновление высоты textarea при входе в режим редактирования
  useEffect(() => {
    if (isEditing && textRef.current) {
      const textarea = textRef.current;
      const { height } = calculateTextDimensions(inputValue);

      // Устанавливаем точные размеры и стили для textarea
      textarea.style.height = `${height}px`;
      textarea.style.padding = "0";
      textarea.style.margin = "0";
      textarea.style.boxSizing = "border-box";
      textarea.style.display = "block";

      textarea.focus();
      setHasStartedTyping(false);
      textarea.select();
    }
    setIsEditingText(isEditing);
  }, [isEditing, setIsEditingText, inputValue, calculateTextDimensions]);

  /**
   * Обработчик нажатия клавиш в режиме редактирования
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      // Ctrl+Enter завершает редактирование
      e.preventDefault();
      setIsEditing(false);
    }
  };

  /**
   * Мутация для удаления слоя
   */
  const removeLayer = useMutation(
    ({ storage }) => {
      storage.get("layers").delete(id);
    },
    [id],
  );

  /**
   * Обработчик потери фокуса - завершает редактирование
   */
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

  /**
   * Разбивает текст на строки
   */
  const getTextLines = (text: string) => {
    return text.split("\n"); // Разбиваем по переносам строк
  };

  /**
   * Получает ширину каждой строки текста
   */
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
        // Режим редактирования - отображаем textarea
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
                  color: fillColor || "#000000",
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
                  // Дополнительные стили для точного контроля интерлиньяжа
                  verticalAlign: "top",
                  textAlign: "left",
                }}
              />
            </div>
          </foreignObject>
        </>
      ) : (
        // Режим отображения - рендерим текст как SVG
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
                fill={fillColor || "#000000"}
                stroke={strokeColor}
                strokeWidth={scaledStrokeWidth}
                opacity={opacity / 100}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
                style={{
                  userSelect: "none",
                  whiteSpace: "pre",
                  overflowWrap: "break-word",
                  mixBlendMode:
                    (blendMode as React.CSSProperties["mixBlendMode"]) ||
                    "normal",
                  letterSpacing: `${letterSpacing}px`,
                  lineHeight: `${lineHeightInPixels}px`,
                }}
              >
                {line}
              </text>
            );
          })}

          {/* Подчеркивание при наведении курсора */}
          {isHovering &&
            shouldShowUnderline &&
            getTextLines(inputValue).map((line, index) => {
              const lineWidths = getLineWidths();
              const lineWidth = lineWidths[index] || 10;
              const lineY = y + index * lineHeightInPixels;

              // Пропускаем пустые строки
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
                  stroke="#4183ff"
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
