"use server";

/**
 * Страница корзины в панели управления
 * Отображает удаленные проекты, которые можно восстановить
 */

import DashboardPageLayout from "~/components/dashboard/DashboardPageLayout";
import TrashRooms from "~/components/dashboard/TrashRooms";

/**
 * Компонент страницы корзины с удаленными проектами
 * Использует контекст для получения данных пользователя
 */
export default async function TrashPage() {
  return (
    <DashboardPageLayout>
      {/* Компонент отображения удаленных проектов */}
      <TrashRooms />
    </DashboardPageLayout>
  );
}
