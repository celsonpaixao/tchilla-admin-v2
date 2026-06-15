"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { Users, UserCheck, Building2 } from "lucide-react";
import type { UserMetrics, UserChartData } from "@/types/metrics.types";
import { MONTHS_PT } from "@/constants/app.constants";
import { KPICard } from "@/components/global/KPICard";
import { PageShell } from "@/components/global/PageShell";

interface UserDashboardProps {
  metricas: UserMetrics | null;
  chartData: UserChartData | null;
}

export function UserDashboard({ metricas, chartData }: UserDashboardProps) {
  const chartFormatted = chartData?.dados.map((d) => ({
    mes: MONTHS_PT[d.mes - 1]?.slice(0, 3) ?? d.mes,
    Clientes: d.totalClientes,
    Parceiros: d.totalParceiros,
    Total: d.totalUsuarios,
  })) ?? [];

  return (
    <PageShell
      title="Relatório de Usuários"
      subtitle={metricas ? `${MONTHS_PT[metricas.mes - 1]} ${metricas.ano}` : undefined}
    >

      {/* KPIs — conforme DS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Total Usuários"
          value={metricas?.totalUsuarios ?? "—"}
          icon={<Users size={16} />}
          spark
        />
        <KPICard
          label="Clientes"
          value={metricas?.totalClientes ?? "—"}
          icon={<UserCheck size={16} />}
          spark
        />
        <KPICard
          label="Parceiros"
          value={metricas?.totalParceiros ?? "—"}
          icon={<Building2 size={16} />}
          accent
          spark
        />
      </div>

      {/* Gráfico */}
      {chartFormatted.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
            Crescimento por Mês — {chartData?.ano}
          </h2>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartFormatted}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--text-3)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-3)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Clientes" stroke="#14AAE9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Parceiros" stroke="#FF4D8D" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Total" stroke="#1F8A5B" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </PageShell>
  );
}
