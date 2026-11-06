import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/constants/app.constants";
import { ROUTES } from "@/constants/routes";

/**
 * Token inválido/expirado: apaga o cookie e manda para o login.
 * Sem isto, o middleware (cookie presente → sai do /login) e o layout (sessão inválida → /login)
 * ficam a redirecionar um para o outro sem fim.
 */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  response.cookies.delete(COOKIE_NAME);
  return response;
}
