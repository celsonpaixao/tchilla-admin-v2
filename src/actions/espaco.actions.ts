"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro, semVazios } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { EspacoAdmin, FiltroEspacos, ResumoEspacos } from "@/types/espaco.types";

export async function fetchEspacos(filtro: FiltroEspacos = {}): Promise<ActionResult<Paginado<EspacoAdmin>>> {
  try {
    const res = await serverFetch<ApiResponse<Paginado<EspacoAdmin>>>("/api/Local/admin", { params: semVazios(filtro) });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function fetchResumoEspacos(): Promise<ActionResult<ResumoEspacos>> {
  try {
    const res = await serverFetch<ApiResponse<ResumoEspacos>>("/api/Local/admin/resumo");
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function suspenderEspaco(id: number, motivo: string): Promise<ActionResult<EspacoAdmin>> {
  try {
    const res = await serverFetch<ApiResponse<EspacoAdmin>>(`/api/Local/admin/${id}/suspender`, {
      method: "PUT",
      body: { motivo },
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function reativarEspaco(id: number): Promise<ActionResult<EspacoAdmin>> {
  try {
    const res = await serverFetch<ApiResponse<EspacoAdmin>>(`/api/Local/admin/${id}/reativar`, { method: "PUT" });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}
