"use client";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FileText, Sparkles, TrendingUp, Users2 } from "lucide-react";
import {
  endOfDay, endOfMonth, format, startOfDay, startOfMonth, subDays, subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";
import { PageShell } from "@/components/global/PageShell";
import { GlobalSelect } from "@/components/global/GlobalSelect";
import { GlobalTable } from "@/components/global/GlobalTable";
import { KPICard } from "@/components/global/KPICard";
import { useBudgetRequests } from "@/hooks/useBudgetRequests";
import { formatPhone } from "@/lib/utils";
import type { BudgetRequest, PeriodoPonto, RankingItem } from "@/types/budgetRequest.types";

type Preset = "7d" | "30d" | "90d" | "mes-atual" | "mes-passado";
type Dimensao = "proposta" | "tipoEvento" | "responsavel";

const PRESET_OPTIONS: Array<{ id: Preset; label: string }> = [
  { id: "7d", label: "Últimos 7 dias" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "90d", label: "Últimos 90 dias" },
  { id: "mes-atual", label: "Este mês" },
  { id: "mes-passado", label: "Mês passado" },
];

const TAB_OPTIONS: Array<{ id: Dimensao; label: string }> = [
  { id: "proposta", label: "Por Proposta" },
  { id: "tipoEvento", label: "Por Tipo de Evento" },
  { id: "responsavel", label: "Por Responsável" },
];

function getRange(preset: Preset): { inicio: Date; fim: Date } {
  const now = new Date();
  switch (preset) {
    case "7d":
      return { inicio: startOfDay(subDays(now, 6)), fim: endOfDay(now) };
    case "90d":
      return { inicio: startOfDay(subDays(now, 89)), fim: endOfDay(now) };
    case "mes-atual":
      return { inicio: startOfMonth(now), fim: endOfDay(now) };
    case "mes-passado": {
      const last = subMonths(now, 1);
      return { inicio: startOfMonth(last), fim: endOfMonth(last) };
    }
    case "30d":
    default:
      return { inicio: startOfDay(subDays(now, 29)), fim: endOfDay(now) };
  }
}

function buildRanking(
  requests: BudgetRequest[],
  keyFn: (r: BudgetRequest) => { chave: string; label: string; telefone?: string },
): RankingItem[] {
  const map = new Map<string, { label: string; telefone?: string; total: number }>();
  for (const r of requests) {
    const { chave, label, telefone } = keyFn(r);
    const curr = map.get(chave);
    if (curr) curr.total += 1;
    else map.set(chave, { label, telefone, total: 1 });
  }
  const total = requests.length;
  return Array.from(map.entries())
    .map(([chave, v]) => ({
      chave,
      label: v.label,
      telefone: v.telefone,
      total: v.total,
      percentual: total ? (v.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function buildPorPeriodo(requests: BudgetRequest[], agruparPorMes: boolean): PeriodoPonto[] {
  const map = new Map<string, PeriodoPonto>();
  for (const r of requests) {
    const date = r.criadoEm.toDate();
    const sortKey = agruparPorMes ? format(date, "yyyy-MM") : format(date, "yyyy-MM-dd");
    const label = agruparPorMes ? format(date, "MMM/yy", { locale: ptBR }) : format(date, "dd/MM");
    const curr = map.get(sortKey);
    if (curr) curr.total += 1;
    else map.set(sortKey, { label, total: 1 });
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

const percentualColumn: ColumnDef<RankingItem, unknown> = {
  accessorKey: "percentual",
  header: "% do total",
  cell: ({ getValue }) => `${(getValue() as number).toFixed(1)}%`,
};

const rankingColumns: ColumnDef<RankingItem, unknown>[] = [
  { id: "posicao", header: "#", cell: ({ row }) => row.index + 1 },
  { accessorKey: "label", header: "Nome" },
  { accessorKey: "total", header: "Solicitações" },
  percentualColumn,
];

const responsavelColumns: ColumnDef<RankingItem, unknown>[] = [
  { id: "posicao", header: "#", cell: ({ row }) => row.index + 1 },
  { accessorKey: "label", header: "Nome" },
  {
    accessorKey: "telefone",
    header: "Telefone/WhatsApp",
    cell: ({ getValue }) => {
      const telefone = getValue() as string | undefined;
      return telefone ? formatPhone(telefone) : "—";
    },
  },
  { accessorKey: "total", header: "Solicitações" },
  percentualColumn,
];

export function OrcamentosRankingPage() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [tab, setTab] = useState<Dimensao>("proposta");
  const { requests, loading, carregar } = useBudgetRequests();

  useEffect(() => {
    const { inicio, fim } = getRange(preset);
    void carregar(inicio, fim);
  }, [preset, carregar]);

  const rankingPropostas = useMemo(
    () => buildRanking(requests, (r) => ({
      chave: String(r.propostaId),
      label: `${r.propostaNome} (${r.propostaType})`,
    })),
    [requests],
  );
  const rankingTipoEvento = useMemo(
    () => buildRanking(requests, (r) => ({
      chave: r.tipoEvento || "Não informado",
      label: r.tipoEvento || "Não informado",
    })),
    [requests],
  );
  const rankingResponsavel = useMemo(
    () => buildRanking(requests, (r) => ({
      chave: r.responsavelNome || "Não informado",
      label: r.responsavelNome || "Não informado",
      telefone: r.responsavelTelefone,
    })),
    [requests],
  );
  const porPeriodo = useMemo(
    () => buildPorPeriodo(requests, preset === "90d"),
    [requests, preset],
  );

  const tabData: Record<Dimensao, RankingItem[]> = {
    proposta: rankingPropostas,
    tipoEvento: rankingTipoEvento,
    responsavel: rankingResponsavel,
  };

  return (
    <PageShell
      title="Ranking de Orçamentos"
      subtitle={`${requests.length} solicitações no período`}
      actions={
        <GlobalSelect
          value={preset}
          onChange={(e) => setPreset(e.target.value as Preset)}
          aria-label="Selecionar período"
          style={{ width: 170 }}
        >
          {PRESET_OPTIONS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </GlobalSelect>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total de solicitações" value={requests.length} icon={<FileText size={16} />} />
        <KPICard label="Proposta mais pedida" value={rankingPropostas[0]?.label ?? "—"} icon={<Sparkles size={16} />} />
        <KPICard label="Tipo de evento em alta" value={rankingTipoEvento[0]?.label ?? "—"} icon={<TrendingUp size={16} />} accent />
        <KPICard label="Responsável destaque" value={rankingResponsavel[0]?.label ?? "—"} icon={<Users2 size={16} />} />
      </div>

      <div
        className="rounded-xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
          Solicitações ao longo do período
        </h2>

        {porPeriodo.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: "var(--text-3)" }}>
            <FileText size={32} className="opacity-20" />
            <p className="text-sm">Sem dados para o período selecionado.</p>
          </div>
        ) : (
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porPeriodo}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-3)" }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 8, fontSize: 12, boxShadow: "var(--shadow-md)",
                  }}
                  labelStyle={{ fontWeight: 600, color: "var(--text)" }}
                />
                <Bar dataKey="total" name="Solicitações" fill="var(--blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex gap-1" style={{ borderBottom: "1px solid var(--border)" }}>
          {TAB_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors"
              style={{
                color: tab === t.id ? "var(--blue)" : "var(--text-3)",
                borderBottom: tab === t.id ? "2px solid var(--blue)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <GlobalTable
          data={tabData[tab]}
          columns={tab === "responsavel" ? responsavelColumns : rankingColumns}
          isLoading={loading}
          searchPlaceholder="Buscar…"
          emptyMessage="Nenhuma solicitação encontrada no período."
        />
      </div>
    </PageShell>
  );
}
