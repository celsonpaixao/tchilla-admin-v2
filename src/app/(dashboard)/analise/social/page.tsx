import type { Metadata } from "next";
import { fetchMetricasSociais } from "@/actions/metricasSociais.actions";
import { MetricasSociaisPage } from "@/components/metricasSociais/MetricasSociaisPage";

export const metadata: Metadata = { title: "Análise — Camada social" };

type SearchParams = Record<string, string | string[] | undefined>;
const texto = (v: string | string[] | undefined) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

export default async function MetricasSociaisPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const inicio = texto(params.de);
  const fim = texto(params.ate);
  const janela = Number(params.janela);
  const janelaDias = Number.isInteger(janela) && janela >= 1 && janela <= 30 ? janela : undefined;
  return <MetricasSociaisPage metricas={await fetchMetricasSociais({ inicio, fim, janelaDias })} />;
}
