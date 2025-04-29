"use server";

/**
 * Страница шаблонов в панели управления
 * Отображает доступные шаблоны для создания новых проектов
 */

import DashboardPageLayout from "~/components/dashboard/DashboardPageLayout";
import Templates from "~/components/dashboard/Templates";

/**
 * Компонент страницы с галереей шаблонов для создания новых проектов
 * Использует контекст для получения данных пользователя
 */
export default async function TemplatesPage() {
  return (
    <DashboardPageLayout>
      {/* Компонент галереи шаблонов */}
      <Templates />
    </DashboardPageLayout>
  );
}
