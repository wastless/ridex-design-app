/**
 * Utility functions for text manipulation and calculations
 */

/**
 * Calculates the dimensions of text based on its properties
 * @param text The text to measure
 * @param fontSize The font size in pixels
 * @param fontWeight The font weight
 * @param fontFamily The font family
 * @param lineHeight The line height coefficient
 * @returns Object containing width, height and line widths
 */
export const calculateTextDimensions = (
  text: string,
  fontSize: number,
  fontWeight: string | number,
  fontFamily: string,
  lineHeight: number
) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (context) {
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // Get metrics for calculating maximum line height
    const lines = text.split("\n");
    const lineWidths = lines.map((line) => context.measureText(line).width);
    const maxWidth = Math.max(...lineWidths, 10);

    const lineCount = lines.length;
    const lineHeightInPixels = Math.round(fontSize * lineHeight);
    const newHeight = Math.max(
      lineCount * lineHeightInPixels,
      lineHeightInPixels,
    );

    return { width: maxWidth, height: newHeight, lineWidths };
  }

  const lineHeightInPixels = Math.round(fontSize * lineHeight);
  return { width: 10, height: lineHeightInPixels, lineWidths: [10] };
}; 