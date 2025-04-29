"use client";

/**
 * Компонент меню пользователя в боковой панели
 *
 * Отображает профиль пользователя и навигационное меню с основными разделами приложения.
 */

import * as Divider from "~/components/ui/divider";
import { UserProfileCard } from "~/components/ui/user-profile-card";
import * as TabMenuVertical from "~/components/ui/tab-menu-vertical";
import { home, main, shared, template, trash, support } from "~/icon";

/**
 * Элементы навигационного меню
 * Каждый элемент содержит название, иконку и ссылку на соответствующий раздел
 */
const items = [
  {
    label: "Главная",
    icon: home,
    href: "/dashboard",
  },
  {
    label: "Все файлы",
    icon: main,
    href: "/dashboard/drafts",
  },
  {
    label: "Общие файлы",
    icon: shared,
    href: "/dashboard/shared-files",
  },
  {
    label: "Шаблоны",
    icon: template,
    href: "/dashboard/templates",
  },
  {
    label: "Корзина",
    icon: trash,
    href: "/dashboard/trash",
  },
];

/**
 * Компонент бокового меню пользователя
 *
 * @param {Object} props - Свойства компонента
 * @param {string | null} props.email - Email пользователя
 * @param {string | null} props.name - Имя пользователя (необязательно)
 * @param {string | null} props.image - Ссылка на изображение профиля (необязательно)
 */
export default function UserMenu({
  email,
  name,
  image,
}: {
  email: string | null;
  name?: string | null;
  image?: string | null;
}) {

  // Не отображаем меню, если нет email пользователя
  if (!email) return null;

  return (
    <>
      {/* Карточка профиля пользователя */}
      <div className="p-3">
        <UserProfileCard email={email} name={name} image={image} />
      </div>
      <div className="px-5">
        <Divider.Root />
      </div>

      <div className="flex h-full flex-col gap-5 px-5 pb-6 pt-5">
        {/* Основное навигационное меню */}
        <TabMenuVertical.Root>
          <TabMenuVertical.List>
            {items.map(({ label, icon: Icon, href }) => (
              <TabMenuVertical.Trigger key={label} href={href}>
                <TabMenuVertical.Icon as={Icon} />
                {label}
              </TabMenuVertical.Trigger>
            ))}
          </TabMenuVertical.List>
        </TabMenuVertical.Root>

        {/* Дополнительное меню внизу панели */}
        <div className="mt-auto space-y-3">
          <Divider.Root />
          <TabMenuVertical.Root>
            <TabMenuVertical.List>
              <TabMenuVertical.Trigger href="/dashboard/help">
                <TabMenuVertical.Icon as={support} />
                Помощь
              </TabMenuVertical.Trigger>
            </TabMenuVertical.List>
          </TabMenuVertical.Root>
        </div>
      </div>
    </>
  );
}
