"use server";

/**
 * Страница черновиков в панели управления
 * Отображает все проекты, созданные пользователем
 */

import Drafts from "~/components/dashboard/Drafts";
import DashboardPageLayout from "~/components/dashboard/DashboardPageLayout";

/**
 * Компонент страницы со списком всех проектов пользователя
 * Использует контекст для получения данных пользователя
 */
export default async function DraftsPage() {
  return (
    <DashboardPageLayout>
      {/* Компонент отображения списка проектов */}
      <Drafts />
    </DashboardPageLayout>
  );
}
