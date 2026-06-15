"use client";
import { useState, useTransition } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { Users, UserCheck, Building2, RefreshCw } from "lucide-react";
import type { UserMetrics, UserChartData } from "@/types/metrics.types";
import { MONTHS_PT } from "@/constants/app.constants";
import { fetchMetricasUsuarios, fetchUserVsParceiros } from "@/actions/metricas.actions";
import { KPICard } from "@/components/global/KPICard";
import { PageShell } from "@/components/global/PageShell";
import { GlobalSelect } from "@/components/global/GlobalSelect";

interface UserDashboardProps {
  metricas:     UserMetrics | null;
  chartData:    UserChartData | null;
  initialMes:   number;
  initialAno:   number;
}

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);

export function UserDashboard({
  metricas: initialMetricas,
  chartData: initialChart,
  initialMes,
  initialAno,
}: UserDashboardProps) {
  const [mes,       setMes]       = useState(initialMes);
  const [ano,       setAno]       = useState(initialAno);
  const [metricas,  setMetricas]  = useState(initialMetricas);
  const [chartData, setChartData] = useState(initialChart);
  const [isPending, startTransition] = useTransition();

  const chartFormatted = (chartData?.dados ?? []).map((d) => ({
    mes:       MONTHS_PT[d.mes - 1]?.slice(0, 3) ?? String(d.mes),
    Clientes:  d.totalClientes,
    Parceiros: d.totalParceiros,
    Total:     d.totalUsuarios,
  }));

  function refetch(newMes: number, newAno: number) {
    setMes(newMes);
    setAno(newAno);
    startTransition(async () => {
      const [mResult, cResult] = await Promise.all([
        fetchMetricasUsuarios(newMes, newAno),
        fetchUserVsParceiros(newAno),
      ]);
      if (mResult.success) setMetricas(mResult.data);
      if (cResult.success) setChartData(cResult.data);
    });
  }

  return (
    <PageShell
      title="Relatório de Utilizadores"
      subtitle={metricas ? `${MONTHS_PT[mes - 1]} ${ano}` : `${ano}`}
      actions={
        <div className="flex items-center gap-2">
          <GlobalSelect
            value={mes}
            onChange={(e) => refetch(Number(e.target.value), ano)}
            aria-label="Selecionar mês"
            style={{ width: 130 }}
          >
            {MONTHS_PT.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </GlobalSelect>

          <GlobalSelect
            value={ano}
            onChange={(e) => refetch(mes, Number(e.target.value))}
            aria-label="Selecionar ano"
            style={{ width: 90 }}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </GlobalSelect>

          {isPending && (
            <RefreshCw
              size={14}
              className="animate-spin"
              style={{ color: "var(--text-3)" }}
            />
          )}
        </div>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Total Utilizadores"
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

      {/* Gráfico — crescimento anual */}
      <div
        className="rounded-xl p-5"
        style={{
          background:   "var(--surface)",
          border:       "1px solid var(--border)",
          boxShadow:    "var(--shadow-sm)",
          opacity:      isPending ? 0.6 : 1,
          transition:   "opacity .2s",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Crescimento por Mês — {chartData?.ano ?? ano}
          </h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {chartFormatted.length} meses
          </span>
        </div>

        {chartFormatted.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 gap-2"
            style={{ color: "var(--text-3)" }}
          >
            <Users size={32} className="opacity-20" />
            <p className="text-sm">Sem dados para {ano}</p>
          </div>
        ) : (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartFormatted}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: "var(--text-3)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--text-3)" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    background:   "var(--surface)",
                    border:       "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize:     12,
                    boxShadow:    "var(--shadow-md)",
                  }}
                  labelStyle={{ fontWeight: 600, color: "var(--text)" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="Clientes"
                  stroke="var(--blue)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Parceiros"
                  stroke="var(--pink)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke="#1F8A5B"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </PageShell>
  );
}
