/**
 * Middleware для защиты маршрутов приложения
 * Проверяет аутентификацию пользователя и перенаправляет неавторизованных пользователей
 * 
 * ВНИМАНИЕ: Временно отключено для отладки проблемы с авторизацией
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Основной обработчик middleware
export async function middleware(request: NextRequest) {
  // Получаем все cookies для отладки
  const cookies = request.cookies;
  console.log('Available cookies:', Array.from(cookies.getAll().map(c => c.name)));
  
  // Проверяем наличие куки сессии
  const hasSessionToken = cookies.has('next-auth.session-token') || 
                          cookies.has('__Secure-next-auth.session-token');
  console.log('Has session cookie:', hasSessionToken);
  
  // Проверка наличия секрета для JWT
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  console.log('Secret available:', !!secret);
  
  // Если есть кука сессии, считаем пользователя авторизованным
  // Это самый надежный способ проверки, не зависящий от JWT
  if (hasSessionToken) {
    console.log('Session cookie exists, allowing access');
    return NextResponse.next();
  }

  // Если нет куки сессии, попробуем проверить JWT токен для дополнительной надежности
  try {
    const token = await getToken({ 
      req: request,
      secret: secret
    });
    
    if (token) {
      console.log('Valid JWT token exists, allowing access');
      return NextResponse.next();
    }
    
    // Если нет ни куки сессии, ни JWT токена - пользователь не авторизован
    console.log('No authentication found, redirecting to signin');
    const signinUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signinUrl);
  } catch (error) {
    // Если произошла ошибка при проверке токена, но есть куки сессии,
    // всё равно разрешаем доступ
    if (hasSessionToken) {
      console.log('Error verifying token, but session cookie exists, allowing access');
      return NextResponse.next();
    }
    
    // В других случаях перенаправляем на страницу входа
    console.log('Authentication error, redirecting to signin');
    const signinUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signinUrl);
  }
}

/**
 * Конфигурация маршрутов для применения middleware
 * Определяет какие пути будут защищены проверкой аутентификации
 */
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};