"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult } from "@/types/common.types";
import type { ApiResponse } from "@/types/common.types";
import type { ReservaInterface, AtualizarStatusRequest } from "@/types/reserva.types";
import type { AgendamentoMetrics } from "@/types/metrics.types";
import type { Paginado } from "@/types/payment.types";
import type { ReservaAdminLinha } from "@/types/admin.types";

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

/**
 * Reservas pendentes para o relatório. A rota antiga (`getAll/Pendente/status`) nunca existiu no
 * back-end, por isso a lista vinha sempre vazia; agora usa `Reserva/admin` e converte para o formato antigo.
 */
export async function fetchReservasPendentes(): Promise<ActionResult<ReservaInterface[]>> {
  try {
    const res = await serverFetch<ApiResponse<Paginado<ReservaAdminLinha>>>("/api/Reserva/admin", {
      params: { estado: "Pendente", ordem: "data", pageSize: 50 },
    });
    const reservas: ReservaInterface[] = (res.data?.data ?? []).map((r) => ({
      id: r.id,
      dataInicio: r.dataInicio,
      dataFim: r.dataFim,
      precoTotal: r.valorTotal,
      pago: r.pago,
      status: r.estado as ReservaInterface["status"],
      tipoEvento: r.tipoEvento ?? "",
      local: r.espaco?.nome?.trim() || r.parceiros.map((p) => p.nome).filter(Boolean).join(", ") || "—",
      imagem: null,
      capacidade: 0,
      cliente: {
        id: r.cliente?.id ?? 0,
        nome: r.cliente?.nome ?? "Cliente",
        email: r.cliente?.email ?? "",
        telefone: r.cliente?.telefone ?? "",
        tipo: "",
        foto: "",
        dataCriacao: "",
      },
      responsaveis: [],
      servicos: [],
    }));
    return { success: true, data: reservas };
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
