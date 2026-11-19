import type { Metadata } from "next";
import { fetchMetricasFunil } from "@/actions/metricasFunil.actions";
import { MetricasFunilPage } from "@/components/metricasFunil/MetricasFunilPage";

export const metadata: Metadata = { title: "Análise — Funil de reservas" };

type SearchParams = Record<string, string | string[] | undefined>;
const texto = (v: string | string[] | undefined) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

export default async function MetricasFunilPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return <MetricasFunilPage metricas={await fetchMetricasFunil({ inicio: texto(params.de), fim: texto(params.ate) })} />;
}
