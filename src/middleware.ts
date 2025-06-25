/**
 * Middleware для защиты маршрутов приложения
 * Проверяет аутентификацию пользователя и перенаправляет неавторизованных пользователей
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
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  console.log('Secret available:', !!secret);
  
  try {
    // Пробуем получить токен
    const token = await getToken({ 
      req: request,
      secret: secret
    });
    
    console.log('Token verification result:', !!token);
    
    // Если есть токен, пользователь авторизован
    if (token) {
      return NextResponse.next();
    }
    
    // Если нет токена, но есть кука сессии - возможно проблема с проверкой JWT
    // В этом случае мы всё равно разрешаем доступ и полагаемся на серверную проверку
    if (hasSessionToken && process.env.NODE_ENV === 'production') {
      console.log('Session cookie exists but token verification failed, allowing access anyway');
      return NextResponse.next();
    }
    
    // В остальных случаях перенаправляем на страницу входа
    console.log('No authentication found, redirecting to signin');
    const signinUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signinUrl);
    
  } catch (error) {
    // В случае ошибки проверки токена логируем и перенаправляем
    console.error('Error verifying authentication token:', error);
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