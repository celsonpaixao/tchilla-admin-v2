import type { Metadata } from "next";
import { fetchMetricasUsuarios, fetchUserVsParceiros } from "@/actions/metricas.actions";
import { UserDashboard } from "@/components/dashboard/UserDashboard";

export const metadata: Metadata = { title: "Usuários — Relatório" };

export default async function UserRelatorioPage() {
  const now = new Date();
  const [metricasResult, chartResult] = await Promise.all([
    fetchMetricasUsuarios(now.getMonth() + 1, now.getFullYear()),
    fetchUserVsParceiros(now.getFullYear()),
  ]);

  return (
    <UserDashboard
      metricas={metricasResult.success ? metricasResult.data : null}
      chartData={chartResult.success ? chartResult.data : null}
    />
  );
}
