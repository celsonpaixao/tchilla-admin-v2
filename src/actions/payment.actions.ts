"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { PagamentoInterface } from "@/types/payment.types";

export async function fetchPagamentos(filters?: {
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<PagamentoInterface[]>> {
  try {
    const data = await serverFetch<ApiResponse<PagamentoInterface[]>>(
      "/api/Payment/getAll",
      { method: "POST", body: filters ?? {} }
    );
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchPagamentosPendentes(): Promise<ActionResult<PagamentoInterface[]>> {
  try {
    const data = await serverFetch<ApiResponse<PagamentoInterface[]>>(
      "/api/Payment/getAll/Pendente/status"
    );
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function validarPagamento(id: number): Promise<ActionResult<void>> {
  try {
    await serverFetch(`/api/Payment/validar/${id}`, { method: "PUT" });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
