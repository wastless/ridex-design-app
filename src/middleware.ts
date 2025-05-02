/**
 * Middleware для защиты маршрутов приложения
 * Проверяет аутентификацию пользователя и перенаправляет неавторизованных пользователей
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Основной обработчик middleware
export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Проверка на наличие токена и путь
  const { pathname } = request.nextUrl;
  
  // Если пользователь не аутентифицирован и пытается перейти на защищенный маршрут
  if (!token && pathname.startsWith('/dashboard')) {
    const signinUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signinUrl);
  }

  // Если пользователь аутентифицирован и пытается получить доступ к странице входа
  if (token && (pathname === '/signin' || pathname === '/signup')) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

/**
 * Конфигурация маршрутов для применения middleware
 * Определяет какие пути будут защищены проверкой аутентификации
 */
export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};