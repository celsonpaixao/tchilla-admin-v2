"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { AgenciaData, AgenciaCreateRequest } from "@/types/agencia.types";

export async function fetchAgencias(): Promise<ActionResult<AgenciaData[]>> {
  try {
    const data = await serverFetch<ApiResponse<AgenciaData[]>>("/api/Agencia/getAll");
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function criarAgencia(body: AgenciaCreateRequest): Promise<ActionResult<void>> {
  try {
    await serverFetch("/api/Auth/register/agencia", { method: "POST", body });
    // Enviar OTP após criar
    await serverFetch("/api/Auth/verify-account", {
      method: "POST",
      body: { email: body.usuarioDto.email },
    }).catch(() => {});
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function atualizarAgencia(id: number, body: Partial<AgenciaData>): Promise<ActionResult<void>> {
  try {
    await serverFetch(`/api/Agencia/update/${id}`, { method: "PUT", body });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function deletarAgencia(id: number): Promise<ActionResult<void>> {
  try {
    await serverFetch(`/api/Agencia/delete/${id}`, { method: "DELETE" });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
