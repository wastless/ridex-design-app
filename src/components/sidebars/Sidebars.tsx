"use client";

import { useMutation, useOthers, useSelf, useStorage } from "@liveblocks/react";
import Link from "next/link";
import { hexToRgb } from "~/utils";
import { RiLayoutLeftLine } from "react-icons/ri";
import * as Divider from "~/components/ui/divider";
import LayerButton from "~/components/ui/layer-button";
import { LayerType } from "~/types";
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
} from "~/icon";
import React, { useState } from "react";
import * as Button from "~/components/ui/button";
import ModeButton from "~/components/ui/mode-button";
import * as Select from "~/components/ui/scale-button";
import { RiArrowDownSLine, RiStackLine, RiCollageLine } from "@remixicon/react";
import { useCanvas } from "~/components/canvas/helper/CanvasContext";
import { scaleItems } from "~/components/ui/scale-button";
import * as Input from "~/components/ui/tageditor";

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
        fill?: string;
        stroke?: string;
        fontSize?: number;
        fontWeight?: number;
        fontFamily?: string;
        tiltAngle?: number;
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
          ...(updates.fill !== undefined && { fill: hexToRgb(updates.fill) }),
          ...(updates.stroke !== undefined && {
            stroke: hexToRgb(updates.stroke),
          }),
          ...(updates.fontSize !== undefined && { fontSize: updates.fontSize }),
          ...(updates.fontWeight !== undefined && {
            fontWeight: updates.fontWeight,
          }),
          ...(updates.fontFamily !== undefined && {
            fontFamily: updates.fontFamily,
          }),
        });
      }
    },
    [selectedLayer],
  );

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
                                  const span = document.createElement("span");
                                  span.style.visibility = "hidden";
                                  span.style.position = "absolute";
                                  span.style.whiteSpace = "nowrap";
                                  span.innerText = text;
                                  document.body.appendChild(span);
                                  const width = span.offsetWidth;
                                  document.body.removeChild(span);
                                  return width > 210
                                    ? text.slice(
                                        0,
                                        Math.floor(text.length * (210 / width)),
                                      ) + "..."
                                    : text;
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
          <div className="p-4 px-3 gap-2 flex flex-col">
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

              <Select.Root
                value={selectedScale}
                onValueChange={handleScaleChange}
              >
                <Select.Trigger></Select.Trigger>
                <Select.Content align="center">
                  {scaleItems.map((item) => (
                    <Select.Item key={item.value} value={item.value}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>

            <Divider.Root />
          </div>

          {/* Пропсы для слоя */}
          {layer ? (
            <>
              <div className="gap-2 p-4 pt-0 pb-2">
                <div className="flex flex-col gap-2">
                  {/* Положение */}
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-paragraph-sm text-text-strong-950">
                      Положение
                    </span>
                    <div className="flex w-[154px] flex-row gap-1.5">
                      <Input.Root>
                        <Input.Wrapper>
                          <Input.Icon as={X_16} />
                          <Input.Input
                            type="number"
                            value={layer?.x ? Number(layer.x.toFixed(2)) : 0}
                            onChange={(e) => {
                              const number = parseFloat(e.target.value);
                              if (!isNaN(number)) {
                                updateLayer({ x: number });
                              }
                            }}
                          />
                        </Input.Wrapper>
                      </Input.Root>

                      <Input.Root>
                        <Input.Wrapper>
                          <Input.Icon as={Y_16} />
                          <Input.Input
                            type="number"
                            value={layer?.y ? Number(layer.y.toFixed(2)) : 0}
                            onChange={(e) => {
                              const number = parseFloat(e.target.value);
                              if (!isNaN(number)) {
                                updateLayer({ y: number });
                              }
                            }}
                          />
                        </Input.Wrapper>
                      </Input.Root>
                    </div>
                  </div>

                  {/* Размер */}
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-paragraph-sm text-text-strong-950">
                      Размер
                    </span>
                    <div className="flex w-[154px] flex-row gap-1.5">
                      <Input.Root>
                        <Input.Wrapper>
                          <Input.Icon as={W_16} />
                          <Input.Input
                            type="number"
                            value={
                              layer?.width ? Number(layer.width.toFixed(2)) : 0
                            }
                            onChange={(e) => {
                              const number = parseFloat(e.target.value);
                              if (
                                !isNaN(number) &&
                                layer?.type !== LayerType.Path
                              ) {
                                updateLayer({ width: number });
                              }
                            }}
                            disabled={layer?.type === LayerType.Path}
                          />
                        </Input.Wrapper>
                      </Input.Root>

                      <Input.Root>
                        <Input.Wrapper>
                          <Input.Icon as={H_16} />
                          <Input.Input
                            type="number"
                            value={
                              layer?.height
                                ? Number(layer.height.toFixed(2))
                                : 0
                            }
                            onChange={(e) => {
                              const number = parseFloat(e.target.value);
                              if (
                                !isNaN(number) &&
                                layer?.type !== LayerType.Path
                              ) {
                                updateLayer({ height: number });
                              }
                            }}
                            disabled={layer?.type === LayerType.Path}
                          />
                        </Input.Wrapper>
                      </Input.Root>
                    </div>
                  </div>

                  {/* Угол наклона */}

                  {/* Радиус скругления */}
                  <div className="flex flex-row items-center justify-between">
                    <span className="text-paragraph-sm text-text-strong-950">
                      Радиус
                    </span>
                    <div className="flex w-[154px] flex-row gap-1.5">
                      <Input.Root>
                        <Input.Wrapper>
                          <Input.Icon as={radius_16} />
                          <Input.Input
                            type="number"
                            value={
                              layer?.type === LayerType.Rectangle
                                ? Number((layer?.cornerRadius ?? 0).toFixed(2))
                                : 0
                            }
                            min={0}
                            max={100}
                            onChange={(e) => {
                              const number = parseFloat(e.target.value);
                              if (
                                !isNaN(number) &&
                                layer?.type === LayerType.Rectangle
                              ) {
                                updateLayer({ cornerRadius: number });
                              }
                            }}
                            disabled={layer?.type !== LayerType.Rectangle}
                          />
                        </Input.Wrapper>
                      </Input.Root>
                    </div>
                  </div>

                  {/* */}
                </div>

                <div className="w-full max-w-96 pt-4">
                  <Divider.Root />
                </div>
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
