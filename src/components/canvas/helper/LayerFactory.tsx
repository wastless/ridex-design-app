import { LiveObject } from "@liveblocks/client";
import {
  LayerType,
  type EllipseLayer,
  type RectangleLayer,
  type TextLayer,
  type TriangleLayer,
} from "~/types";

export function createLayer(
  layerType: LayerType,
  x: number,
  y: number,
  width: number,
  height: number,
  textContent?: string,
  isFixedSize = false
) {
  const baseProps = {
    x,
    y,
    width,
    height,
    opacity: 100,
    blendMode: "normal",
  };

  if (layerType === LayerType.Rectangle) {
    return new LiveObject<RectangleLayer>({
      type: LayerType.Rectangle,
      ...baseProps,
      fill: { r: 217, g: 217, b: 217 },
      stroke: null,
    });
  } else if (layerType === LayerType.Ellipse) {
    return new LiveObject<EllipseLayer>({
      type: LayerType.Ellipse,
      ...baseProps,
      fill: { r: 217, g: 217, b: 217 },
      stroke: null,
    });
  } else if (layerType === LayerType.Triangle) {
    return new LiveObject<TriangleLayer>({
      type: LayerType.Triangle,
      ...baseProps,
      fill: { r: 217, g: 217, b: 217 },
      stroke: null,
    });
  } else if (layerType === LayerType.Text) {
    return new LiveObject<TextLayer>({
      type: LayerType.Text,
      ...baseProps,
      text: textContent ?? "",
      fontSize: 16,
      fontWeight: 400,
      fontFamily: "Inter",
      lineHeight: 1,
      letterSpacing: 0,
      stroke: null,
      fill: { r: 0, g: 0, b: 0 },
      isFixedSize,
    });
  }

  return null;
}
