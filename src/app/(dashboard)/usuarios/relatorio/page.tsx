import type { Metadata } from "next";
import { fetchMetricasUsuarios, fetchUserVsParceiros } from "@/actions/metricas.actions";
import { UserDashboard } from "@/components/dashboard/UserDashboard";

export const metadata: Metadata = { title: "Utilizadores — Relatório" };

export default async function UserRelatorioPage() {
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  const [metricasResult, chartResult] = await Promise.all([
    fetchMetricasUsuarios(mes, ano),
    fetchUserVsParceiros(ano),
  ]);

  return (
    <UserDashboard
      metricas={metricasResult.success ? metricasResult.data : null}
      chartData={chartResult.success  ? chartResult.data  : null}
      initialMes={mes}
      initialAno={ano}
    />
  );
}
