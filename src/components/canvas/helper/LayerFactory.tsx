import { LiveObject } from "@liveblocks/client";
import {
  EllipseLayer,
  LayerType,
  RectangleLayer,
  TextLayer,
  TriangleLayer,
} from "~/types";

export function createLayer(
  layerType: LayerType,
  x: number,
  y: number,
  width: number,
  height: number,
  textContent?: string,
) {
  const baseProps = {
    x,
    y,
    width,
    height,
    opacity: 100,
  };

  if (layerType === LayerType.Rectangle) {
    return new LiveObject<RectangleLayer>({
      type: LayerType.Rectangle,
      ...baseProps,
      fill: { r: 217, g: 217, b: 217 },
      stroke: { r: 217, g: 217, b: 217 },
    });
  } else if (layerType === LayerType.Ellipse) {
    return new LiveObject<EllipseLayer>({
      type: LayerType.Ellipse,
      ...baseProps,
      fill: { r: 217, g: 217, b: 217 },
      stroke: { r: 217, g: 217, b: 217 },
    });
  } else if (layerType === LayerType.Triangle) {
    return new LiveObject<TriangleLayer>({
      type: LayerType.Triangle,
      ...baseProps,
      fill: { r: 217, g: 217, b: 217 },
      stroke: { r: 217, g: 217, b: 217 },
    });
  } else if (layerType === LayerType.Text) {
    return new LiveObject<TextLayer>({
      type: LayerType.Text,
      ...baseProps,
      text: textContent ?? "",
      fontSize: 16,
      fontWeight: 400,
      fontFamily: "Inter",
      stroke: null,
      fill: { r: 0, g: 0, b: 0 },
      overflow: "visible",
    });
  }

  return null;
}
