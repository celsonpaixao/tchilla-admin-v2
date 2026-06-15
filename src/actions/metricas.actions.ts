"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { UserMetrics, UserChartData, DashboardMetrics } from "@/types/metrics.types";

export async function fetchMetricasGerais(): Promise<ActionResult<DashboardMetrics>> {
  try {
    const data = await serverFetch<ApiResponse<DashboardMetrics>>("/api/Reserva/metricas");
    return { success: true, data: data.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchMetricasUsuarios(
  mes: number,
  ano: number
): Promise<ActionResult<UserMetrics>> {
  try {
    const data = await serverFetch<UserMetrics>("/api/Metricas/usuarios", {
      params: { mes, ano },
    });
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchUserVsParceiros(ano: number): Promise<ActionResult<UserChartData>> {
  try {
    const data = await serverFetch<UserChartData>(
      "/api/Metricas/usuarios-vs-parceiros/por-mes",
      { params: { ano } }
    );
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
