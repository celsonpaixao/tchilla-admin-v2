"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult } from "@/types/common.types";
import type { ApiResponse } from "@/types/common.types";
import type { ReservaInterface, AtualizarStatusRequest } from "@/types/reserva.types";
import type { AgendamentoMetrics } from "@/types/metrics.types";

export async function fetchReservas(): Promise<ActionResult<ReservaInterface[]>> {
  try {
    const data = await serverFetch<ApiResponse<ReservaInterface[]>>(
      "/api/Reserva/getAll/supervisor"
    );
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchReservasPendentes(): Promise<ActionResult<ReservaInterface[]>> {
  try {
    const data = await serverFetch<ApiResponse<ReservaInterface[]>>(
      "/api/Reserva/getAll/Pendente/status"
    );
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchReservaById(id: number): Promise<ActionResult<ReservaInterface>> {
  try {
    const data = await serverFetch<ApiResponse<ReservaInterface>>(`/api/Reserva/get/${id}`);
    return { success: true, data: data.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function atualizarStatusReserva(
  body: AtualizarStatusRequest
): Promise<ActionResult<void>> {
  try {
    await serverFetch("/api/Reserva/AtualizarStatus", {
      method: "PUT",
      body,
    });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchMetricasReservas(): Promise<ActionResult<AgendamentoMetrics>> {
  try {
    const data = await serverFetch<ApiResponse<AgendamentoMetrics>>("/api/Metricas/geral");
    return { success: true, data: data.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
