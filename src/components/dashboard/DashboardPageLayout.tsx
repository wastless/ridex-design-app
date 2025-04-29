"use client";

/**
 * Компонент макета страниц панели управления
 * Отвечает за размещение основных элементов интерфейса на страницах Dashboard
 */

import UserMenu from "~/components/dashboard/UserMenu";
import Header from "~/components/dashboard/Header";
import { useUser } from "~/hooks/use-user";

/**
 * Интерфейс свойств компонента макета панели управления
 */
interface DashboardPageLayoutProps {
  children: React.ReactNode;
}

/**
 * Компонент макета страниц в разделе Dashboard
 * Структурирует страницу, отображая боковое меню пользователя и основной контент
 * Использует контекст для получения данных пользователя
 *
 * @param {DashboardPageLayoutProps} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы (содержимое страницы)
 */
export default function DashboardPageLayout({
  children,
}: DashboardPageLayoutProps) {
  // Получаем данные пользователя из контекста
  const user = useUser();

  return (
    <>
      <div className="flex h-screen min-w-[272px] flex-col border-r border-stroke-soft-200 bg-bg-white-0">
        {/* Боковое меню пользователя */}
        <UserMenu email={user.email} name={user.name} image={user.image} />
      </div>

      <div className="mx-auto flex w-full flex-1 flex-col">
        {/* Заголовок страницы */}
        <Header />
        {/* Основное содержимое */}
        {children}
      </div>
    </>
  );
}
