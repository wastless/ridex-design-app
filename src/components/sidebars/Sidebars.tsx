"use client";

import { useMutation, useOthers, useSelf, useStorage } from "@liveblocks/react";
import Link from "next/link";
import { colorToCss, hexToRgb } from "~/utils";
import { RiLayoutLeftLine } from "react-icons/ri";
import * as Divider from "~/components/ui/divider";
import LayerButton from "~/components/ui/layer-button";
import { LayerType, Color as ColorType } from "~/types";
import {
  Rectangle_16,
  Ellipse_16,
  Text_16,
  Image_16,
  Minimized_icon,
  X_16,
  Y_16,
  H_16,
  W_16,
  radius_16,
  style_16,
  percent_16,
  minus_16,
  plus_16,
} from "~/icon";
import React, { useState } from "react";
import * as Button from "~/components/ui/button";
import ModeButton from "~/components/ui/mode-button";
import * as ScaleButton from "~/components/ui/scale-button";
import { RiArrowDownSLine, RiStackLine, RiCollageLine } from "@remixicon/react";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { scaleItems } from "~/components/ui/scale-button";
import * as Input from "~/components/ui/tageditor";
import * as Select from "~/components/ui/select";
import { blendModes } from "~/data/blendModes";
import { Color as ColorPicker } from "./Color";
import ColorRow from "./ColorRow";
import OpacityRow from "./OpacityRow";
import BasicSettings from "./BasicSettings";
import StrokeRow from "./StrokeRow";

export default function Sidebar({
  leftIsMinimized,
  setLeftIsMinimized,
}: {
  leftIsMinimized: boolean;
  setLeftIsMinimized: (value: boolean) => void;
}) {
  const me = useSelf();
  const others = useOthers();
  const { camera, setCamera } = useCanvas();

  const roomName = "Проект";
  const [layerMode, setLayerMode] = useState("layers_mode");
  const [selectedScale, setSelectedScale] = useState("1");

  const selectedLayer = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  const layer = useStorage((root) => {
    if (!selectedLayer) {
      return null;
    }
    return root.layers.get(selectedLayer);
  });

  const roomColor = useStorage((root) => root.roomColor);

  const layers = useStorage((root) => root.layers);
  const layerIds = useStorage((root) => root.layerIds);
  const reversedLayerIds = [...(layerIds ?? [])].reverse();

  const selection = useSelf((me) => me.presence.selection);

  // Function to handle scale change
  const handleScaleChange = (value: string) => {
    setSelectedScale(value);
    const zoomValue = parseFloat(value);
    setCamera((prevCamera) => ({
      ...prevCamera,
      zoom: zoomValue,
    }));
  };

  // Update selectedScale when camera.zoom changes
  React.useEffect(() => {
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
        fontSize?: number;
        fontWeight?: number;
        fontFamily?: string;
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
          ...(updates.fontSize !== undefined && { fontSize: updates.fontSize }),
          ...(updates.fontWeight !== undefined && {
            fontWeight: updates.fontWeight,
          }),
          ...(updates.fontFamily !== undefined && {
            fontFamily: updates.fontFamily,
          }),
          ...(updates.blendMode !== undefined && {
            blendMode: updates.blendMode,
          }),
        });
      }
    },
    [selectedLayer],
  );

  const handleColorChange = (color: string, type: "fill" | "stroke") => {
    if (!selectedLayer || !color) return;

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

  return (
    <>
      {/* Верхняя панель */}
      {!leftIsMinimized ? (
        <div className="fixed relative left-0 top-0 flex h-[48px] w-full select-none items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-2">
          <div className="flex flex-row items-center gap-2">
            <img
              src="/icon/ridex-logo.svg"
              alt="RideX"
              className="h-[32px] w-[32px]"
            />
            <div className="flex items-center gap-2 text-paragraph-sm">
              <Link
                href="/dashboard"
                className="text-text-sub-600 hover:text-text-strong-950"
              >
                Черновик
              </Link>
              <span className="text-text-sub-600">/</span>

              <button className="flex items-center gap-1">
                <span className="text-text-strong-950">
                  {roomName?.length > 15
                    ? roomName.slice(0, 15) + "..."
                    : roomName}
                </span>
                <RiArrowDownSLine className="h-4 w-4 text-text-strong-950 transition-transform duration-200 ease-out hover:translate-y-[2px]" />
              </button>
            </div>
          </div>

          <div className="flex flex-row items-center gap-3">
            <span> Users</span>

            <Button.Root variant="primary" mode="lighter" size="xsmall">
              Поделиться
            </Button.Root>
          </div>
        </div>
      ) : null}

      {/* Левая панель */}
      {!leftIsMinimized ? (
        <div className="fixed left-0 top-[48px] flex h-screen w-[260px] select-none flex-col border-r border-stroke-soft-200 bg-bg-white-0">
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-row gap-1">
                <ModeButton
                  onSelect={() => setLayerMode("layers_mode")}
                  active={layerMode === "layers_mode"}
                  text="Слои"
                />

                <ModeButton
                  onSelect={() => setLayerMode("templates")}
                  active={layerMode === "templates"}
                  text="Шаблоны"
                />
              </div>

              <div className="cursor-pointer rounded-md p-1 hover:bg-bg-weak-50">
                <Minimized_icon onClick={() => setLeftIsMinimized(true)} />
              </div>
            </div>
          </div>

          <div className="w-full max-w-96 px-4">
            <Divider.Root />
          </div>

          {layerMode === "layers_mode" && (
            <div className="flex flex-col gap-1 p-4 pt-2">
              <div className="flex flex-col gap-1">
                {layerIds &&
                  reversedLayerIds.map((id) => {
                    const layer = layers?.get(id);
                    const isSelected = selection?.includes(id);
                    if (layer?.type === LayerType.Rectangle) {
                      return (
                        <LayerButton
                          key={id}
                          layerId={id}
                          text={`Прямоугольник ${
                            layerIds
                              .filter(
                                (layerId) =>
                                  layers?.get(layerId)?.type ===
                                  LayerType.Rectangle,
                              )
                              .indexOf(id) + 1
                          }`}
                          isSelected={isSelected ?? false}
                          icon={
                            <Rectangle_16 className="color-icon-strong-950" />
                          }
                        />
                      );
                    } else if (layer?.type === LayerType.Ellipse) {
                      return (
                        <LayerButton
                          key={id}
                          layerId={id}
                          text={`Эллипс ${
                            layerIds
                              .filter(
                                (layerId) =>
                                  layers?.get(layerId)?.type ===
                                  LayerType.Ellipse,
                              )
                              .indexOf(id) + 1
                          }`}
                          isSelected={isSelected ?? false}
                          icon={
                            <Ellipse_16 className="color-icon-strong-950" />
                          }
                        />
                      );
                    } else if (layer?.type === LayerType.Path) {
                      return (
                        <LayerButton
                          key={id}
                          layerId={id}
                          text={`Векторный путь ${
                            layerIds
                              .filter(
                                (layerId) =>
                                  layers?.get(layerId)?.type === LayerType.Path,
                              )
                              .indexOf(id) + 1
                          }`}
                          isSelected={isSelected ?? false}
                          icon={
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              className="text-text-strong-950"
                            >
                              <path
                                d={layer.points
                                  .map((point, index) => {
                                    const [x = 0, y = 0] = point ?? [0, 0];
                                    const scaledX =
                                      (x / (layer.width ?? 1)) * 10 + 3;
                                    const scaledY =
                                      (y / (layer.height ?? 1)) * 10 + 3;
                                    return `${index === 0 ? "M" : "L"} ${scaledX} ${scaledY}`;
                                  })
                                  .join(" ")}
                                stroke="currentColor"
                                fill="none"
                                strokeWidth="1"
                              />
                            </svg>
                          }
                        />
                      );
                    } else if (layer?.type === LayerType.Text) {
                      return (
                        <LayerButton
                          key={id}
                          layerId={id}
                          text={
                            layer.text.length === 0
                              ? "Текст"
                              : ((text) => {
                                  // Join multi-line text with spaces
                                  const singleLineText = text
                                    .split("\n")
                                    .join(" ");

                                  // If text is already short enough, return it as is
                                  if (singleLineText.length <= 20) {
                                    return singleLineText;
                                  }

                                  // Calculate a fixed character limit based on average character width
                                  // This prevents shifting when spaces are added
                                  const maxChars = 20; // Fixed character limit
                                  return singleLineText.length > maxChars
                                    ? singleLineText.slice(0, maxChars) + "..."
                                    : singleLineText;
                                })(layer.text)
                          }
                          isSelected={isSelected ?? false}
                          icon={<Text_16 className="color-icon-strong-950" />}
                        />
                      );
                    }
                  })}
              </div>
            </div>
          )}

          {layerMode === "templates" && (
            <div className="flex flex-col gap-1 p-4">
              <div className="text-text-sub-600">
                Шаблоны будут доступны в ближайшее время
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="fixed left-3 top-3 flex h-[48px] w-[280px] select-none items-center justify-between rounded-xl border bg-white p-4 shadow-regular-sm">
          <div className="flex items-center gap-2">
            <img
              src="/icon/ridex-logo.svg"
              alt="RideX"
              className="h-[32px] w-[32px]"
            />
            <button className="flex items-center gap-1 text-paragraph-sm">
              <span className="text-text-strong-950">
                {roomName?.length > 15
                  ? roomName.slice(0, 15) + "..."
                  : roomName}
              </span>
              <RiArrowDownSLine className="h-4 w-4 text-text-strong-950 transition-transform duration-200 ease-out hover:translate-y-[2px]" />
            </button>
          </div>

          <div className="cursor-pointer rounded-md p-1 hover:bg-bg-weak-50">
            <Minimized_icon onClick={() => setLeftIsMinimized(false)} />
          </div>
        </div>
      )}

      {/* Правая панель */}
      {!leftIsMinimized || layer ? (
        <div
          className={`fixed ${leftIsMinimized && layer ? "bottom-3 right-[16px] top-[16px] flex rounded-xl" : ""} ${!leftIsMinimized && !layer ? "h-screen" : ""} ${!leftIsMinimized && layer ? "bottom-0 top-[48px] h-screen" : ""} right-0 ${leftIsMinimized ? "top-[16px]" : "top-[48px]"} flex w-[280px] select-none flex-col border-l border-stroke-soft-200 bg-bg-white-0`}
        >
          <div className="flex flex-col gap-2 p-4 px-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-row gap-1">
                <ModeButton
                  onSelect={() => setLayerMode("layers_mode")}
                  active={layerMode === "layers_mode"}
                  text="Дизайн"
                />

                <ModeButton
                  onSelect={() => setLayerMode("templates")}
                  active={layerMode === "templates"}
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

          {/* Пропсы для слоя */}
          {layer ? (
            <>
              {/* Основные настройки: положение, размер, радиус скругления */}
              <div className="flex flex-col gap-2 p-4 pb-2 pt-0">
                <BasicSettings layer={layer} onUpdateLayer={updateLayer} />
              </div>

              <div className="w-full max-w-96 p-3">
                <Divider.Root />
              </div>

              {/* Режим смешивания */}
              <div className="flex flex-col gap-2 p-4 py-0">
                <OpacityRow layer={layer} onUpdateLayer={updateLayer} />
              </div>

              <div className="w-full max-w-96 p-3">
                <Divider.Root />
              </div>

              {/* Заливка */}
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

              {/* Обводка */}
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
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}
