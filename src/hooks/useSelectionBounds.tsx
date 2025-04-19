/*** Хук для вычисления границ выделенных слоев ***/

import { useSelf, useStorage } from "@liveblocks/react";
import { shallow } from "@liveblocks/client";
import { LayerType } from "~/types";

export default function useSelectionBounds() {
  const selection = useSelf((me) => me.presence.selection);
  return useStorage((root) => {
    const selectedLayers = selection
      ?.map((layerId) => root.layers.get(layerId)!)
      .filter(Boolean);

    if (!selectedLayers || selectedLayers.length === 0) {
      return null;
    }

    // For text layers, we need to calculate the actual bounds based on text content
    const bounds = selectedLayers.map(layer => {
      if (layer.type === LayerType.Text) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (context) {
          context.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
          
          // Split text by newlines
          const lines = layer.text.split("\n");
          const lineWidths = lines.map(line => context.measureText(line).width);
          const maxWidth = Math.max(...lineWidths, 10); // Minimum width
          
          // Calculate height based on line count and line height
          const lineCount = lines.length;
          const height = Math.max(
            lineCount * layer.fontSize * layer.lineHeight,
            layer.fontSize // Minimum height
          );
          
          return {
            x: layer.x,
            y: layer.y,
            width: maxWidth,
            height: height
          };
        }
      }
      
      return {
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height
      };
    });

    // Calculate the bounding box that contains all selected layers
    const x = Math.min(...bounds.map(b => b.x));
    const y = Math.min(...bounds.map(b => b.y));
    const width = Math.max(...bounds.map(b => b.x + b.width)) - x;
    const height = Math.max(...bounds.map(b => b.y + b.height)) - y;

    return { x, y, width, height };
  }, shallow);
}
