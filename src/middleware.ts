import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Экспортируем обработчик, который проверяет аутентификацию запроса
export async function middleware(req: NextRequest) {
  try {
    // Получаем токен из запроса
    const token = await getToken({ 
      req,
      secret: process.env.AUTH_SECRET 
    });

    const isAuthenticated = !!token;
    const isAuthPage = req.nextUrl.pathname === "/signin" || req.nextUrl.pathname === "/signup";

    // Если пользователь аутентифицирован и пытается зайти на страницу авторизации
    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Если пользователь не аутентифицирован и пытается зайти на защищенную страницу
    if (!isAuthenticated && !isAuthPage) {
      const signInUrl = new URL("/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // В остальных случаях продолжаем выполнение запроса
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // В случае ошибки перенаправляем на страницу входа
    return NextResponse.redirect(new URL("/signin", req.url));
  }
}

// Конфигурация маршрутов, к которым применяется этот обработчик
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/signin",
    "/signup"
  ],
};
