"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { MetricasFunil } from "@/types/metricasFunil.types";

/** Datas em yyyy-MM-dd (dias de Luanda, fim incluído); sem datas são os últimos 30 dias. */
export async function fetchMetricasFunil(filtros: { inicio?: string; fim?: string }): Promise<ActionResult<MetricasFunil>> {
  const params: Record<string, string> = {};
  if (filtros.inicio) params.inicio = filtros.inicio;
  if (filtros.fim) params.fim = filtros.fim;
  try {
    const res = await serverFetch<ApiResponse<MetricasFunil>>("/api/Metricas/funil", { params });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}
