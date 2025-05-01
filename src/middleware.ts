import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Экспортируем обработчик, который проверяет аутентификацию запроса
export default async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ 
      req,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });
    
    const isAuthenticated = !!token;

    if (!isAuthenticated) {
      const newUrl = new URL("/signin", req.nextUrl.origin);
      return NextResponse.redirect(newUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    const newUrl = new URL("/signin", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }
}

// Конфигурация маршрутов, к которым применяется этот обработчик
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
