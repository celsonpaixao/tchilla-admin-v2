"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro, semVazios } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type {
  AgenciaData,
  FiltroParceiros,
  ParceiroAdmin,
  ParceiroDetalhe,
  ResumoParceiros,
} from "@/types/agencia.types";

/** Lista simples de agências (usada nas campanhas). */
export async function fetchAgencias(): Promise<ActionResult<AgenciaData[]>> {
  try {
    const data = await serverFetch<ApiResponse<AgenciaData[]>>("/api/Agencia/getAll");
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function fetchParceiros(
  filtro: FiltroParceiros = {},
): Promise<ActionResult<Paginado<ParceiroAdmin>>> {
  try {
    const res = await serverFetch<ApiResponse<Paginado<ParceiroAdmin>>>("/api/Agencia/admin", {
      params: semVazios(filtro),
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function fetchResumoParceiros(): Promise<ActionResult<ResumoParceiros>> {
  try {
    const res = await serverFetch<ApiResponse<ResumoParceiros>>("/api/Agencia/admin/resumo");
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function fetchParceiro(id: number): Promise<ActionResult<ParceiroDetalhe>> {
  try {
    const res = await serverFetch<ApiResponse<ParceiroDetalhe>>(`/api/Agencia/admin/${id}`);
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function aprovarParceiro(id: number): Promise<ActionResult<ParceiroAdmin>> {
  try {
    const res = await serverFetch<ApiResponse<ParceiroAdmin>>(`/api/Agencia/admin/${id}/aprovar`, { method: "PUT" });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function rejeitarParceiro(id: number, motivo: string): Promise<ActionResult<ParceiroAdmin>> {
  try {
    const res = await serverFetch<ApiResponse<ParceiroAdmin>>(`/api/Agencia/admin/${id}/rejeitar`, {
      method: "PUT",
      body: { motivo },
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function suspenderParceiro(id: number, motivo: string): Promise<ActionResult<ParceiroAdmin>> {
  try {
    const res = await serverFetch<ApiResponse<ParceiroAdmin>>(`/api/Agencia/admin/${id}/suspender`, {
      method: "PUT",
      body: { motivo },
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}
