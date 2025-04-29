import React, { useState, useMemo } from "react";
import { useStorage, useRoom } from "@liveblocks/react";
import { LiveMap, LiveObject } from "@liveblocks/client";
import { Rectangle_16, Ellipse_16, Text_16, Frame_16, Image_16 } from "~/icon";
import LayerButton from "~/components/ui/layer-button";
import { LayerType, FrameLayer, Layer } from "~/types";
import { generateLayerName } from "~/utils";

// Correct type for layer storage to accommodate LiveMap and ReadonlyMap
export type LayersStorage =
  | LiveMap<string, LiveObject<Layer>>
  | Map<string, Layer>
  | ReadonlyMap<string, Layer>
  | ReadonlyMap<string, LiveObject<Layer>>;


// Props for the RenderLayersList component
interface RenderLayersListProps {
  layerIds: readonly string[];
  layers: LayersStorage;
  selection: readonly string[];
  level?: number;
  processedIds?: Set<string>;
  roomId: string;
}

// Recursive component for rendering layers with nesting
export const RenderLayersList: React.FC<RenderLayersListProps> = ({
  layerIds,
  layers,
  selection,
  level = 0,
  processedIds = new Set<string>(),
  roomId,
}) => {
  // State to track expanded state of each layer - by default all frames are expanded
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(() => {
    // Start with all frame IDs expanded by default
    const initialExpanded = new Set<string>();

    // Helper function to find all frames and mark them as expanded
    const findFramesRecursive = (
      ids: readonly string[],
      processed = new Set<string>(),
    ) => {
      ids.forEach((id) => {
        if (processed.has(id)) return;
        processed.add(id);

        const layer = layers?.get(id);
        if (!layer) return;

        // Check if it's a frame layer
        const layerType = "get" in layer ? layer.get("type") : layer.type;

        if (layerType === LayerType.Frame) {
          // Add this frame to expanded set
          initialExpanded.add(id);

          // Get child IDs and process them too (for nested frames)
          const childIds =
            "get" in layer
              ? (layer.toObject() as FrameLayer).childIds || []
              : (layer as FrameLayer).childIds || [];

          findFramesRecursive(childIds, processed);
        }
      });
    };

    // Start with top-level layers
    findFramesRecursive(layerIds);

    return initialExpanded;
  });

  // Toggle expanded state of a specific layer
  const toggleLayerExpanded = (layerId: string) => {
    setExpandedLayers((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(layerId)) {
        newExpanded.delete(layerId);
      } else {
        newExpanded.add(layerId);
      }
      return newExpanded;
    });
  };

  // We want to display layers in reverse order (newer on top), but only for the top level
  const displayLayerIds = level === 0 ? [...layerIds].reverse() : layerIds;

  return (
    <div className="flex flex-col gap-1" style={{ paddingLeft: level * 16 }}>
      {displayLayerIds.map((id) => {
        // Skip already processed IDs to avoid duplication, but only for non-frame layers
        // This allows frames to be both parents and standalone layers
        if (processedIds.has(id)) {
          // Ensure this ID is not a frame; if it is, we'll still want to render it
          const layer = layers?.get(id);
          if (!layer) return null;

          const isLiveObject = "get" in layer;
          const layerType = isLiveObject ? layer.get("type") : layer.type;

          // If it's not a frame, we can skip it
          if (layerType !== LayerType.Frame) {
            return null;
          }
        }

        // Mark as processed to avoid duplicates
        const localProcessedIds = new Set(processedIds);
        localProcessedIds.add(id);

        const layer = layers?.get(id);
        if (!layer) return null;

        // Handle properties for both direct objects and LiveObjects
        const isLiveObject = "get" in layer;
        const layerType = isLiveObject ? layer.get("type") : layer.type;

        // Get the layer's children if it's a frame
        let childIds: readonly string[] = [];
        if (layerType === LayerType.Frame) {
          if (isLiveObject) {
            // For LiveObjects, we must use toObject() to get the childIds
            const frameData = layer.toObject() as FrameLayer;
            childIds = frameData.childIds || [];
          } else {
            // For direct objects
            childIds = (layer as FrameLayer).childIds || [];
          }
        }

        const hasChildren = childIds.length > 0;
        const isExpanded = expandedLayers.has(id);
        const isSelected = selection?.includes(id);

        let icon;
        let layerName = "";

        // Определяем имя слоя на основе его типа и ID
        if (layerType !== undefined) {
          layerName = generateLayerName(id, layerType, roomId);
        }

        // Determine icon based on type
        if (layerType === LayerType.Rectangle) {
          icon = <Rectangle_16 className="color-icon-strong-950" />;
        } else if (layerType === LayerType.Ellipse) {
          icon = <Ellipse_16 className="color-icon-strong-950" />;
        } else if (layerType === LayerType.Path) {
          icon = (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className="text-text-strong-950"
            >
              <path
                d={((): string => {
                  // Check if layer is a PathLayer with points
                  if (isLiveObject) {
                    const layerObj = layer.toObject();
                    if (
                      "points" in layerObj &&
                      Array.isArray(layerObj.points)
                    ) {
                      const points = layerObj.points;
                      const width = layer.get("width");
                      const height = layer.get("height");
                      return points
                        .map((point: any, index: number) => {
                          const [x = 0, y = 0] = point ?? [0, 0];
                          const scaledX = (x / (width ?? 1)) * 10 + 3;
                          const scaledY = (y / (height ?? 1)) * 10 + 3;
                          return `${index === 0 ? "M" : "L"} ${scaledX} ${scaledY}`;
                        })
                        .join(" ");
                    }
                  } else if ("points" in layer && Array.isArray(layer.points)) {
                    const points = layer.points;
                    const width = layer.width;
                    const height = layer.height;
                    return points
                      .map((point: any, index: number) => {
                        const [x = 0, y = 0] = point ?? [0, 0];
                        const scaledX = (x / (width ?? 1)) * 10 + 3;
                        const scaledY = (y / (height ?? 1)) * 10 + 3;
                        return `${index === 0 ? "M" : "L"} ${scaledX} ${scaledY}`;
                      })
                      .join(" ");
                  }
                  return "M0 0"; // Default empty path
                })()}
                stroke="currentColor"
                fill="none"
                strokeWidth="1"
              />
            </svg>
          );
        } else if (layerType === LayerType.Text) {
          icon = <Text_16 className="color-icon-strong-950" />;

          // Safely get text content with proper type checking
          const textContent = ((): string => {
            if (isLiveObject) {
              const layerObj = layer.toObject();
              return "text" in layerObj ? layerObj.text : "";
            } else if ("text" in layer) {
              return layer.text;
            }
            return "";
          })();

          // Используем текст как название, если он не пустой
          if (textContent.length > 0) {
            const singleLineText = textContent.split("\n").join(" ");
            if (singleLineText.length <= 20) {
              layerName = singleLineText;
            } else {
              const maxChars = 20;
              layerName = singleLineText.length > maxChars
                ? singleLineText.slice(0, maxChars) + "..."
                : singleLineText;
            }
          }
        } else if (layerType === LayerType.Frame) {
          icon = <Frame_16 className="text-white bg-primary-base rounded-[4px]" />;
        } else if (layerType === LayerType.Image) {
          icon = <Image_16 className="color-icon-strong-950" />;
          
          // Для слоя изображения используем короткое название с расширением
          layerName = layerName.replace('Image', 'image.jpg');
        }

        // Debug log to see what's happening with frames and children
        if (layerType === LayerType.Frame) {
          console.log(`Rendering Frame ${id} in tree, childIds:`, childIds);
        }

        return (
          <React.Fragment key={id}>
            <LayerButton
              layerId={id}
              text={layerName}
              isSelected={isSelected ?? false}
              icon={icon}
              hasChildren={hasChildren}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleLayerExpanded(id)}
            />

            {/* Only render children if the layer has children and is expanded */}
            {hasChildren && isExpanded && (
              <RenderLayersList
                layerIds={childIds}
                layers={layers}
                selection={selection}
                level={level + 1}
                processedIds={localProcessedIds}
                roomId={roomId}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Props for the AllLayersTree component
interface AllLayersTreeProps {
  layers: LayersStorage;
  selection: readonly string[];
}

// AllLayersTree component for displaying all layers, including nested ones
export const AllLayersTree: React.FC<AllLayersTreeProps> = ({
  layers,
  selection,
}) => {
  // Get all layer IDs from storage
  const layerIds = useStorage((root) => root.layerIds);
  const room = useRoom();
  const roomId = room.id;

  if (!layerIds) return null;

  // Debug log to check what we're starting with
  console.log("Top level layerIds:", [...layerIds]);

  return (
    <div className="flex flex-col gap-1">
      <RenderLayersList
        layerIds={layerIds}
        layers={layers}
        selection={selection}
        roomId={roomId}
      />
    </div>
  );
};

export default AllLayersTree;
