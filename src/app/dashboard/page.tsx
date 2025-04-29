"use server";

/**
 * Главная страница панели управления
 * Отображает недавние проекты и быстрые действия для пользователя
 */

import DashboardPageLayout from "~/components/dashboard/DashboardPageLayout";
import QuickActions from "~/components/dashboard/QuickActions";
import RecentRooms from "~/components/dashboard/RecentRooms";

/**
 * Компонент главной страницы панели управления
 * Включает блок быстрых действий и список недавних проектов
 * Данные о пользователе автоматически загружаются и доступны через контекст
 */
export default async function DashboardPage() {
  return (
    <DashboardPageLayout>
      {/* Блок быстрых действий (создание проекта, импорт и т.д.) */}
      <QuickActions />
      {/* Список недавних проектов пользователя */}
      <RecentRooms />
    </DashboardPageLayout>
  );
}
