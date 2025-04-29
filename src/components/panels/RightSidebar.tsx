import React, { useState, useEffect } from "react";
import { useMutation, useSelf, useOthers, useStorage } from "@liveblocks/react";
import * as Divider from "~/components/ui/divider";
import ModeButton from "~/components/ui/mode-button";
import * as ScaleButton from "~/components/ui/scale-button";
import * as Button from "~/components/ui/button";
import { scaleItems } from "~/components/ui/scale-button";
import { connectionIdToColor, hexToRgb } from "~/utils";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import ColorRow from "./props/ColorRow";
import OpacityRow from "./props/OpacityRow";
import BasicSettings from "./props/BasicSettings";
import StrokeRow from "./props/StrokeRow";
import BgColor from "./props/BgColor";
import TextRow from "./props/TextRow";
import UserAvatar from "./UserAvatar";
import { Tutorial } from "./Tutorial";
import { Color as ColorType, Layer } from "~/types";
import {
  Root as AvatarGroup,
  Overflow as AvatarGroupOverflow,
} from "~/components/ui/avatar-group";
import ShareMenu from "./ShareMenu";

interface RightSidebarProps {
  leftIsMinimized: boolean;
  layer: any;
  roomId?: string;
  othersWithAccessToRoom?: any[];
  owner?: any;
  isOwner?: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  leftIsMinimized,
  layer,
  roomId,
  othersWithAccessToRoom,
  owner,
  isOwner,
}) => {
  const { camera, setCamera } = useCanvas();
  const [rightSidebarMode, setRightSidebarMode] = useState("design");
  const [selectedScale, setSelectedScale] = useState("1");
  const roomColor = useStorage((root) => root.roomColor);
  const me = useSelf();
  const others = useOthers();
  
  // Get the selected layer ID for updates
  const selectedLayerId = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  // Function to handle scale change
  const handleScaleChange = (value: string) => {
    setSelectedScale(value);
    const zoomValue = parseFloat(value);
    const canvas = document.querySelector("svg");
    if (canvas) {
      const centerPoint = {
        x: canvas.clientWidth / 2,
        y: canvas.clientHeight / 2,
      };
      setCamera((prevCamera) => {
        const scale = zoomValue / prevCamera.zoom;
        const newX = centerPoint.x - (centerPoint.x - prevCamera.x) * scale;
        const newY = centerPoint.y - (centerPoint.y - prevCamera.y) * scale;
        return { ...prevCamera, zoom: zoomValue, x: newX, y: newY };
      });
    }
  };

  // Update selectedScale when camera.zoom changes
  useEffect(() => {
    const zoomValue = camera.zoom.toString();
    if (scaleItems.some((item) => item.value === zoomValue)) {
      setSelectedScale(zoomValue);
    } else {
      // Find the closest scale value
      const closestScale = scaleItems.reduce((prev, curr) => {
        return Math.abs(parseFloat(curr.value) - camera.zoom) <
          Math.abs(parseFloat(prev.value) - camera.zoom)
          ? curr
          : prev;
      });
      setSelectedScale(closestScale.value);
    }
  }, [camera.zoom]);

  const updateLayer = useMutation(
    (
      { storage },
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
      if (!layer || !selectedLayerId) return;

      const liveLayers = storage.get("layers");
      const layerObj = liveLayers.get(selectedLayerId);

      if (layerObj) {
        layerObj.update({
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
    [selectedLayerId],
  );

  const handleColorChange = (color: string, type: "fill" | "stroke") => {
    if (!layer || !color) return;

    try {
      // If color is already a Color object, use it directly
      if (
        typeof color === "object" &&
        "r" in color &&
        "g" in color &&
        "b" in color
      ) {
        updateLayer({
          [type]: color,
        });
        return;
      }

      // Otherwise, convert hex color to RGB object
      const colorObj = hexToRgb(color);
      if (!colorObj) return;

      // Update the layer with the new color
      updateLayer({
        [type]: colorObj,
      });
    } catch (error) {
      console.error("Error updating color:", error);
    }
  };

  const updateRoomColor = useMutation(({ storage }, color: ColorType) => {
    storage.set("roomColor", color);
  }, []);

  const className = `fixed ${
    leftIsMinimized && layer ? "bottom-3 right-3 top-3 flex rounded-xl" : ""
  } ${!leftIsMinimized && !layer ? "h-screen" : ""} ${
    !leftIsMinimized && layer ? "bottom-0 top-[48px] h-screen" : ""
  } right-0 ${
    leftIsMinimized ? "top-3" : "top-[48px]"
  } flex w-[280px] select-none flex-col border-l border-stroke-soft-200 bg-bg-white-0`;

  return (
    <div className={className}>
      {leftIsMinimized && layer && (
        <div className="flex items-center justify-between px-4 pb-0 pt-2">
          <AvatarGroup size="32">
            {me && (
              <UserAvatar
                color={connectionIdToColor(me.connectionId)}
                name={me.info.name}
                image={me.info.image}
              />
            )}
            {others.length > 2 ? (
              <>
                {others.slice(0, 2).map((other) => (
                  <UserAvatar
                    key={other.connectionId}
                    color={connectionIdToColor(other.connectionId)}
                    name={other.info.name}
                    image={other.info.image}
                  />
                ))}
                <AvatarGroupOverflow>
                  +{others.length - 2}
                </AvatarGroupOverflow>
              </>
            ) : (
              others.map((other) => (
                <UserAvatar
                  key={other.connectionId}
                  color={connectionIdToColor(other.connectionId)}
                  name={other.info.name}
                  image={other.info.image}
                />
              ))
            )}
          </AvatarGroup>
          <Button.Root variant="primary" mode="lighter" size="xsmall">
            Поделиться
          </Button.Root>
        </div>
      )}

      <div className="flex flex-col gap-2 p-4 px-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-row gap-1">
            <ModeButton
              onSelect={() => setRightSidebarMode("design")}
              active={rightSidebarMode === "design"}
              text="Дизайн"
            />

            <ModeButton
              onSelect={() => setRightSidebarMode("tutorial")}
              active={rightSidebarMode === "tutorial"}
              text="Учебник"
            />
          </div>

          <ScaleButton.Root
            value={selectedScale}
            onValueChange={handleScaleChange}
          >
            <ScaleButton.Trigger></ScaleButton.Trigger>
            <ScaleButton.Content align="center">
              {scaleItems.map((item) => (
                <ScaleButton.Item key={item.value} value={item.value}>
                  {item.label}
                </ScaleButton.Item>
              ))}
            </ScaleButton.Content>
          </ScaleButton.Root>
        </div>

        <Divider.Root />
      </div>

      {/* Content based on mode */}
      {layer && rightSidebarMode === "design" ? (
        <>
          {/* Basic settings: position, size, corner radius */}
          <div className="flex flex-col gap-2 p-4 pb-2 pt-0">
            <BasicSettings layer={layer} onUpdateLayer={updateLayer} />
          </div>

          <div className="w-full max-w-96 p-3">
            <Divider.Root />
          </div>

          {/* Opacity and blend mode */}
          <div className="flex flex-col gap-2 p-4 py-0">
            <OpacityRow layer={layer} onUpdateLayer={updateLayer} />
          </div>

          <div className="w-full max-w-96 p-3">
            <Divider.Root />
          </div>

          {/* Text settings if layer is text */}
          {layer?.type === 4 && (
            <>
              <div className="flex flex-col gap-2 p-4 py-0">
                <TextRow layer={layer} onUpdateLayer={updateLayer} />
              </div>

              <div className="w-full max-w-96 p-3">
                <Divider.Root />
              </div>
            </>
          )}

          {/* Fill color */}
          <div className="flex flex-col gap-2 p-4 py-0">
            <ColorRow
              layer={layer}
              onUpdateLayer={updateLayer}
              onColorChange={handleColorChange}
            />
          </div>

          <div className="w-full max-w-96 p-3">
            <Divider.Root />
          </div>

          {/* Stroke settings */}
          <div className="flex flex-col gap-2 p-4 py-0">
            <StrokeRow
              layer={layer}
              onUpdateLayer={updateLayer}
              onColorChange={handleColorChange}
            />
          </div>

          <div className="w-full max-w-96 p-3">
            <Divider.Root />
          </div>
        </>
      ) : rightSidebarMode === "tutorial" ? (
        <div className="px-4">
          <Tutorial />
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4 py-0">
          <BgColor roomColor={roomColor} setRoomColor={updateRoomColor} />
        </div>
      )}
    </div>
  );
};

export const MinimizedRightSidebar: React.FC<{
  roomId: string;
  othersWithAccessToRoom: any[];
  owner: any;
  isOwner: boolean;
}> = ({ roomId, othersWithAccessToRoom, owner, isOwner }) => {
  const me = useSelf();
  const others = useOthers();

  return (
    <div className="py2 fixed right-3 top-3 flex h-[48px] w-[280px] select-none items-center justify-between rounded-xl border bg-white px-4 shadow-regular-sm">
      <div className="flex w-full flex-row items-center justify-between">
        <AvatarGroup size="32">
          {me && (
            <UserAvatar
              color={connectionIdToColor(me.connectionId)}
              name={me.info.name}
              image={me.info.image}
            />
          )}
          {others.length > 2 ? (
            <>
              {others.slice(0, 2).map((other) => (
                <UserAvatar
                  key={other.connectionId}
                  color={connectionIdToColor(other.connectionId)}
                  name={other.info.name}
                  image={other.info.image}
                />
              ))}
              <AvatarGroupOverflow>
                +{others.length - 2}
              </AvatarGroupOverflow>
            </>
          ) : (
            others.map((other) => (
              <UserAvatar
                key={other.connectionId}
                color={connectionIdToColor(other.connectionId)}
                name={other.info.name}
                image={other.info.image}
              />
            ))
          )}
        </AvatarGroup>

        <ShareMenu
          roomId={roomId}
          othersWithAccessToRoom={othersWithAccessToRoom}
          owner={owner}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
};

export default RightSidebar; 