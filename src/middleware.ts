import { auth } from "./server/auth";

// Экспортируем обработчик, который проверяет аутентификацию запроса
export default auth((req) => {
    const isAuthenticated = !!req.auth;

    if (!isAuthenticated) {
        const newUrl = new URL("/signin", req.nextUrl.origin);
        return Response.redirect(newUrl);
    }
});

// Конфигурация маршрутов, к которым применяется этот обработчик
export const config = {
    matcher: ["/dashboard", "/dashboard/:path*"],
};
