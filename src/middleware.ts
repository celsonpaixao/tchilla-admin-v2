import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "./constants/app.constants";
import { ROUTES } from "./constants/routes";

const PUBLIC_ROUTES = [ROUTES.LOGIN, "/api/auth"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Sem token → redireciona para login (exceto rotas públicas)
  if (!token && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(url);
  }

  // Com token na raiz → redireciona para o dashboard
  if (token && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.HOME;
    return NextResponse.redirect(url);
  }

  // Com token na página de login → redireciona para home
  if (token && pathname === ROUTES.LOGIN) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.HOME;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sounds|assets|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
