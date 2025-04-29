import React, { useState } from "react";
import * as Divider from "~/components/ui/divider";
import ModeButton from "~/components/ui/mode-button";
import { Minimized_icon } from "~/icon";
import { useStorage, useSelf } from "@liveblocks/react";
import AllLayersTree from "~/components/canvas/LayerTree";
import { RiArrowDownSLine } from "@remixicon/react";
import TemplatesTab from "./TemplatesTab";
import Image from "next/image";

interface LeftSidebarProps {
  setLeftIsMinimized: (value: boolean) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  setLeftIsMinimized,
}) => {
  const [layerMode, setLayerMode] = useState("layers_mode");
  const layers = useStorage((root) => root.layers);
  const selection = useSelf((me) => me.presence.selection);

  return (
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
        <div className="flex flex-col gap-1 p-4 pt-2 h-full overflow-hidden hover:overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stroke-soft-200 hover:[&::-webkit-scrollbar-thumb]:bg-stroke-soft-300">
          {layers && selection && (
            <AllLayersTree 
              layers={layers} 
              selection={selection || []} 
            />
          )}
        </div>
      )}

      {layerMode === "templates" && (
        <div className="h-full overflow-hidden">
          <TemplatesTab />
        </div>
      )}
    </div>
  );
};

export const MinimizedLeftSidebar: React.FC<{
  setLeftIsMinimized: (value: boolean) => void;
  roomName: string;
}> = ({ setLeftIsMinimized, roomName }) => {
  return (
    <div className="fixed left-3 top-3 flex h-[48px] w-[280px] select-none items-center justify-between rounded-xl border bg-white p-4 shadow-regular-sm">
      <div className="flex items-center gap-2">
        <Image
          src="/icon/ridex-logo.svg"
          alt="RideX"
          width={32}
          height={32}
          className="h-[32px] w-[32px]"
        />
        <button className="flex items-center gap-1 text-paragraph-sm">
          <span className="text-text-strong-950">{roomName}</span>
          <RiArrowDownSLine className="h-4 w-4 text-text-strong-950 transition-transform duration-200 ease-out hover:translate-y-[2px]" />
        </button>
      </div>

      <div className="cursor-pointer rounded-md p-1 hover:bg-bg-weak-50">
        <Minimized_icon onClick={() => setLeftIsMinimized(false)} />
      </div>
    </div>
  );
};

export default LeftSidebar; 