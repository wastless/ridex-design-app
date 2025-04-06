"use client";

import { useMutation } from "@liveblocks/react";
import { ReactNode } from "react";

/** Кнопка для выбора слоя **/
const LayerButton = ({
  layerId,
  text,
  icon,
  isSelected,
}: {
  layerId: string;
  text: string;
  icon: ReactNode;
  isSelected: boolean;
}) => {
  // Обновления выбора слоя
  const updateSelection = useMutation(({ setMyPresence }, layerId: string) => {
    setMyPresence({ selection: [layerId] }, { addToHistory: true });
  }, []);

  return (
    <button
      className={`text-strong-950 flex items-center gap-2 rounded-lg p-1 py-2 pl-2 text-left text-paragraph-sm ${
        isSelected ? "bg-[#C2D6FF]" : "hover:bg-bg-weak-50"
      }`}
      onClick={() => updateSelection(layerId)}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

export default LayerButton;
