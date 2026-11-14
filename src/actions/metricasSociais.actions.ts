"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { MetricasSociais } from "@/types/metricasSociais.types";

/** Datas em yyyy-MM-dd (dias de Luanda, fim incluído); sem datas são os últimos 30 dias. */
export async function fetchMetricasSociais(filtros: { inicio?: string; fim?: string; janelaDias?: number }): Promise<ActionResult<MetricasSociais>> {
  const params: Record<string, string> = {};
  if (filtros.inicio) params.inicio = filtros.inicio;
  if (filtros.fim) params.fim = filtros.fim;
  if (filtros.janelaDias) params.janelaDias = String(filtros.janelaDias);
  try {
    const res = await serverFetch<ApiResponse<MetricasSociais>>("/api/Metricas/social", { params });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}
