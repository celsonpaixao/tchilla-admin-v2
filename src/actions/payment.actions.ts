"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro as mensagemDe, semVazios } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type {
  ComissaoInterface,
  FiltroComissoes,
  FiltroPagamentos,
  PagamentoInterface,
  Paginado,
  ResumoFinanceiro,
} from "@/types/payment.types";

export async function fetchPagamentos(
  filtro: FiltroPagamentos = {},
): Promise<ActionResult<Paginado<PagamentoInterface>>> {
  try {
    const res = await serverFetch<ApiResponse<Paginado<PagamentoInterface>>>("/api/Payment/admin", {
      params: semVazios(filtro),
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDe(err) };
  }
}

export async function fetchResumoFinanceiro(
  periodo: { de?: string; ate?: string } = {},
): Promise<ActionResult<ResumoFinanceiro>> {
  try {
    const res = await serverFetch<ApiResponse<ResumoFinanceiro>>("/api/Payment/admin/resumo", {
      params: semVazios(periodo),
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDe(err) };
  }
}

export async function validarTransferencia(id: number): Promise<ActionResult<PagamentoInterface>> {
  try {
    const res = await serverFetch<ApiResponse<PagamentoInterface>>(`/api/Payment/admin/${id}/validar`, {
      method: "PUT",
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDe(err) };
  }
}

export async function rejeitarTransferencia(
  id: number,
  motivo: string,
): Promise<ActionResult<PagamentoInterface>> {
  try {
    const res = await serverFetch<ApiResponse<PagamentoInterface>>(`/api/Payment/admin/${id}/rejeitar`, {
      method: "PUT",
      body: { motivo },
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDe(err) };
  }
}

export async function fetchComissoes(
  filtro: FiltroComissoes = {},
): Promise<ActionResult<Paginado<ComissaoInterface>>> {
  try {
    const res = await serverFetch<ApiResponse<Paginado<ComissaoInterface>>>("/api/Payment/admin/comissoes", {
      params: semVazios(filtro),
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDe(err) };
  }
}

/** Confirma que a Tchilla recebeu o pagamento da comissão (rota já existente no back-end). */
export async function confirmarComissao(id: number): Promise<ActionResult<void>> {
  try {
    await serverFetch(`/api/Payment/comissao/${id}`, { method: "POST", params: { estado: "Pago" } });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: mensagemDe(err) };
  }
}
