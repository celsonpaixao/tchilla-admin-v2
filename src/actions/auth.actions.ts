"use server";
import { redirect } from "next/navigation";
import { setToken, clearToken, getToken } from "@/lib/auth/cookies";
import type { ApiResponse, ActionResult } from "@/types/common.types";
import type { UsuarioInterface } from "@/types/user.types";
import { ROUTES } from "@/constants/routes";

export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult<void>> {
  try {
    const res = await fetch(`${process.env.API_URL}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername: email, password, role: "supervisor" }),
    });

    const data: ApiResponse<string> = await res.json();

    if (!data.isSuccess || !data.data) {
      return { success: false, error: data.message || data.errorMessage || "Credenciais inválidas" };
    }

    await setToken(data.data);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

export async function logoutAction(): Promise<void> {
  const token = await getToken();
  if (token) {
    await fetch(`${process.env.API_URL}/api/Auth/logout`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  await clearToken();
  redirect(ROUTES.LOGIN);
}

export async function getUserInfoAction(): Promise<ActionResult<UsuarioInterface>> {
  const token = await getToken();
  if (!token) return { success: false, error: "Não autenticado", code: 401 };

  try {
    const res = await fetch(`${process.env.API_URL}/api/Usuario/getInfoByToken`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data: ApiResponse<UsuarioInterface> = await res.json();
    if (!data.isSuccess) return { success: false, error: data.message };

    return { success: true, data: data.data };
  } catch {
    return { success: false, error: "Erro ao buscar dados do usuário" };
  }
}
