"use client";

/**
 * Отображает блок быстрых действий на панели управления.
 * Предоставляет пользователю возможность создать различные типы дизайнов
 * через набор кнопок с иконками.
 */

import * as ActionButton from "~/components/ui/actions";
import {
  file,
  for_you,
  image_editor,
  presentation,
  printer,
  social_network,
} from "~/icon";

export default function QuickActions() {
  return (
    <div className="space-y-6 px-8 py-6">
      {/* Блок быстрых действий с кнопками для создания дизайнов */}
      <div className="flex h-[200px] w-full flex-col items-center justify-center gap-5 rounded-2xl bg-primary-base shadow-fancy-buttons-primary">
        <h1 className="text-title-h4 text-text-white-0">
          Давайте создадим новый дизайн
        </h1>
        <div className="flex gap-4">
          {/* Кнопка создания дизайна */}
          <ActionButton.Root>
            <ActionButton.Icon as={for_you} />
            <ActionButton.Text>Создать</ActionButton.Text>
          </ActionButton.Root>

          {/* Кнопка истории дизайнов */}
          <ActionButton.Root>
            <ActionButton.Icon as={image_editor} />
            <ActionButton.Text>История</ActionButton.Text>
          </ActionButton.Root>

          {/* Кнопка создания документа */}
          <ActionButton.Root>
            <ActionButton.Icon as={file} />
            <ActionButton.Text>Документ</ActionButton.Text>
          </ActionButton.Root>

          {/* Кнопка создания презентации */}
          <ActionButton.Root>
            <ActionButton.Icon as={presentation} />
            <ActionButton.Text>Презентация</ActionButton.Text>
          </ActionButton.Root>

          {/* Кнопка создания дизайна для соцсетей */}
          <ActionButton.Root>
            <ActionButton.Icon as={social_network} />
            <ActionButton.Text>Соцсети</ActionButton.Text>
          </ActionButton.Root>

          {/* Кнопка создания дизайна для печати */}
          <ActionButton.Root>
            <ActionButton.Icon as={printer} />
            <ActionButton.Text>Печать</ActionButton.Text>
          </ActionButton.Root>
        </div>
      </div>
    </div>
  );
}
