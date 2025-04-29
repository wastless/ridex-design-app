"use client";

import { useMutation } from "@liveblocks/react";
import type { ReactNode } from "react";
import { arrow_down_s_fill as ArrowDownIcon } from "~/icon";

/** Кнопка для выбора слоя **/
const LayerButton = ({
  layerId,
  text,
  icon,
  isSelected,
  hasChildren,
  isExpanded,
  onToggleExpand
}: {
  layerId: string;
  text: string;
  icon: ReactNode;
  isSelected: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) => {
  // Обновления выбора слоя
  const updateSelection = useMutation(({ setMyPresence }, layerId: string) => {
    setMyPresence({ selection: [layerId] }, { addToHistory: true });
  }, []);
  
  // Toggle expand/collapse without selecting the layer
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand();
    }
  };

  return (
    <button
      className={`text-strong-950 flex items-center gap-2 rounded-lg p-1 py-2 pl-2 text-left text-paragraph-sm ${
        isSelected ? "bg-[#C2D6FF]" : "hover:bg-bg-weak-50"
      }`}
      onClick={() => updateSelection(layerId)}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
        {/* Show toggle arrow for layers with children (like frame) */}
        {hasChildren && (
          <div 
            className="flex items-center cursor-pointer" 
            onClick={toggleExpand}
          >
            {ArrowDownIcon({
              className: `h-4 w-4 text-text-sub-600 transition-transform ${isExpanded ? '' : '-rotate-90'}`
            })}
          </div>
        )}
        {icon}
        </div>
        
        <span>{text}</span>
      </div>
    </button>
  );
};

export default LayerButton;
