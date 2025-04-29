"use client";

/**
 * Компонент заголовка панели управления
 *
 * Отображает верхнюю часть интерфейса с полем поиска и кнопками действий.
 * Содержит функциональность для создания нового дизайна и импорта.
 */

import { RiSearch2Line } from "react-icons/ri";
import * as Button from "~/components/ui/button";
import * as Divider from "~/components/ui/divider";
import * as Input from "~/components/ui/input";
import { import_, plus_16 } from "~/icon";
import { createRoom } from "~/app/actions/rooms";

/**
 * Компонент заголовка панели управления
 * Предоставляет поиск, кнопки создания дизайна и импорта файлов
 */
export default function Header() {
  return (
    <>
      <div className="flex justify-between px-8 py-5">
        {/* Поле поиска */}
        <div className="w-full max-w-[340px]">
          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiSearch2Line} />
              <Input.Input placeholder="Искать по шаблонам и дизайнам" />
            </Input.Wrapper>
          </Input.Root>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-2">
          <Button.Root variant="neutral" mode="stroke">
            <Button.Icon as={import_} />
            Импорт
          </Button.Root>

          <Button.Root
            variant="primary"
            mode="lighter"
            onClick={() => createRoom()}
          >
            <Button.Icon as={plus_16} />
            Создать дизайн
          </Button.Root>
        </div>
      </div>

      {/* Разделительная линия */}
      <div className="px-5">
        <Divider.Root />
      </div>
    </>
  );
}
