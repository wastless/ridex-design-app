/**
 * Middleware для защиты маршрутов приложения
 * Проверяет аутентификацию пользователя и перенаправляет неавторизованных пользователей
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Основной обработчик middleware
export async function middleware(request: NextRequest) {
  // Проверка наличия секрета (для отладки)
  const hasSecret = !!process.env.AUTH_SECRET;
  console.log(`AUTH_SECRET exists: ${hasSecret}`);

  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  });

  // Отладочная информация о токене
  console.log(`Token exists: ${!!token}`);
  
  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!token) {
    const signinUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

/**
 * Конфигурация маршрутов для применения middleware
 * Определяет какие пути будут защищены проверкой аутентификации
 */
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};