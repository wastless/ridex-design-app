"use server";

/**
 * Страница общих проектов в панели управления
 * Отображает проекты, которыми поделились с пользователем
 */

import SharedRooms from "~/components/dashboard/SharedRooms";
import DashboardPageLayout from "~/components/dashboard/DashboardPageLayout";

/**
 * Компонент страницы со списком проектов, к которым у пользователя есть доступ
 * через приглашения от других пользователей
 * Использует контекст для получения данных пользователя
 */
export default async function SharedFilesPage() {
  return (
    <DashboardPageLayout>
      {/* Компонент отображения списка общих проектов */}
      <SharedRooms />
    </DashboardPageLayout>
  );
}
