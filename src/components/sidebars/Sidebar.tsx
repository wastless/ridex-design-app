import { useMutation, useSelf } from "@liveblocks/react";
import { hexToRgb } from "~/utils";

export default function Sidebar() {
  const selectedLayer = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  const updateLayer = useMutation(
    (
      { storage }: { storage: any },
      updates: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        opacity?: number;
        cornerRadius?: number;
        fill?: string | null;
        stroke?: string;
        strokeWidth?: number;
        fontSize?: number;
        fontWeight?: number;
        fontFamily?: string;
        lineHeight?: number;
        letterSpacing?: number;
        tiltAngle?: number;
        blendMode?: string;
      },
    ) => {
      if (!selectedLayer) return;

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(selectedLayer);

      if (layer) {
        layer.update({
          ...(updates.x !== undefined && { x: updates.x }),
          ...(updates.y !== undefined && { y: updates.y }),
          ...(updates.width !== undefined && { width: updates.width }),
          ...(updates.height !== undefined && { height: updates.height }),
          ...(updates.opacity !== undefined && { opacity: updates.opacity }),
          ...(updates.cornerRadius !== undefined && {
            cornerRadius: updates.cornerRadius,
          }),
          ...(updates.fill !== undefined && {
            fill:
              updates.fill === null
                ? null
                : typeof updates.fill === "string"
                  ? hexToRgb(updates.fill)
                  : updates.fill,
          }),
          ...(updates.stroke !== undefined && {
            stroke:
              typeof updates.stroke === "string"
                ? hexToRgb(updates.stroke)
                : updates.stroke,
          }),
          ...(updates.strokeWidth !== undefined && {
            strokeWidth: updates.strokeWidth,
          }),
          ...(updates.fontSize !== undefined && { fontSize: updates.fontSize }),
          ...(updates.fontWeight !== undefined && {
            fontWeight: updates.fontWeight,
          }),
          ...(updates.fontFamily !== undefined && {
            fontFamily: updates.fontFamily,
          }),
          ...(updates.lineHeight !== undefined && {
            lineHeight: updates.lineHeight,
          }),
          ...(updates.letterSpacing !== undefined && {
            letterSpacing: updates.letterSpacing,
          }),
          ...(updates.blendMode !== undefined && {
            blendMode: updates.blendMode,
          }),
        });
      }
    },
    [selectedLayer],
  );

  return null;
} 