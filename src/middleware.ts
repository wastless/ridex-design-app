/**
 * Middleware для защиты маршрутов приложения
 * Проверяет аутентификацию пользователя и перенаправляет неавторизованных пользователей
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Основной обработчик middleware
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Пропускаем запросы к API и статическим файлам
  if (path.startsWith('/api/') || path.includes('.')) {
    return NextResponse.next();
  }
  
  // Получаем токен пользователя
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Если пользователь не аутентифицирован и пытается получить доступ к защищенным маршрутам
  const isAuthPage = path === '/signin' || path === '/signup';
  
  if (!token && !isAuthPage) {
    // Перенаправляем на страницу входа с указанием пути возврата
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signinUrl);
  }

  // Если пользователь уже аутентифицирован и пытается получить доступ к страницам аутентификации
  if (token && isAuthPage) {
    // Перенаправляем на дашборд
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Конфигурация маршрутов для применения middleware
 * Определяет какие пути будут защищены проверкой аутентификации
 */
export const config = {
  matcher: [
    // Проверка всех страниц, кроме статических файлов и API
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg)).*)',
  ],
};