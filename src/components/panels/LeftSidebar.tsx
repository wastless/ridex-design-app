/**
 * Левая боковая панель приложения отвечает за отображение иерархии слоев проекта, 
 * переключение между режимами просмотра слоев и шаблонов, а также за сворачивание и разворачивание панели. 
 * Компонент интегрирован с Liveblocks для совместной работы и отображения актуального состояния слоев и выделения.
 */

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
  // Состояние для переключения между режимами: "слои" и "шаблоны"
  const [layerMode, setLayerMode] = useState("layers_mode");
  // Получаем список слоев из Liveblocks-хранилища
  const layers = useStorage((root) => root.layers);
  // Получаем текущее выделение пользователя
  const selection = useSelf((me) => me.presence.selection);

  return (
    // Основной контейнер левой панели с фиксированным позиционированием
    <div className="fixed left-0 top-[48px] flex h-screen w-[260px] select-none flex-col border-r border-stroke-soft-200 bg-bg-white-0">
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-row gap-1">
            {/* Кнопка переключения в режим слоев */}
            <ModeButton
              onSelect={() => setLayerMode("layers_mode")}
              active={layerMode === "layers_mode"}
              text="Слои"
            />

            {/* Кнопка переключения в режим шаблонов */}
            <ModeButton
              onSelect={() => setLayerMode("templates")}
              active={layerMode === "templates"}
              text="Шаблоны"
            />
          </div>

          {/* Кнопка для сворачивания панели */}
          <div className="cursor-pointer rounded-md p-1 hover:bg-bg-weak-50">
            <Minimized_icon onClick={() => setLeftIsMinimized(true)} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-96 px-4">
        <Divider.Root />
      </div>

      {/* Отображение дерева слоев или вкладки шаблонов в зависимости от режима */}
      {layerMode === "layers_mode" && (
        <div className="flex flex-col gap-1 p-4 pt-2 h-full overflow-hidden hover:overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stroke-soft-200 hover:[&::-webkit-scrollbar-thumb]:bg-stroke-soft-300">
          {/* Дерево слоев отображается только если есть данные о слоях и выделении */}
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

// Компонент свернутой левой панели: отображает логотип и название комнаты, а также кнопку для разворачивания панели
export const MinimizedLeftSidebar: React.FC<{
  setLeftIsMinimized: (value: boolean) => void;
  roomName: string;
}> = ({ setLeftIsMinimized, roomName }) => {
  return (
    <div className="fixed left-3 top-3 flex h-[48px] w-[280px] select-none items-center justify-between rounded-xl border bg-white p-4 shadow-regular-sm">
      <div className="flex items-center gap-2">
        {/* Логотип приложения */}
        <Image
          src="/icon/ridex-logo.svg"
          alt="RideX"
          width={32}
          height={32}
          className="h-[32px] w-[32px]"
        />
        {/* Название комнаты с иконкой раскрытия */}
        <button className="flex items-center gap-1 text-paragraph-sm">
          <span className="text-text-strong-950">{roomName}</span>
          <RiArrowDownSLine className="h-4 w-4 text-text-strong-950 transition-transform duration-200 ease-out hover:translate-y-[2px]" />
        </button>
      </div>

      {/* Кнопка для разворачивания панели */}
      <div className="cursor-pointer rounded-md p-1 hover:bg-bg-weak-50">
        <Minimized_icon onClick={() => setLeftIsMinimized(false)} />
      </div>
    </div>
  );
};

export default LeftSidebar; 