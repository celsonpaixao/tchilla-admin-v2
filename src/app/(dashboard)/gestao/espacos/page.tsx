import type { Metadata } from "next";
import { fetchEspacos, fetchResumoEspacos } from "@/actions/espaco.actions";
import { EspacosPage } from "@/components/espacos/EspacosPage";
import { filtroEspacos, tabEspacos, type SearchParams } from "@/components/espacos/filtros";

export const metadata: Metadata = { title: "Gestão — Espaços" };

export default async function EspacosPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filtro = filtroEspacos(params);
  const [lista, resumo] = await Promise.all([fetchEspacos(filtro), fetchResumoEspacos()]);

  return <EspacosPage tab={tabEspacos(params)} filtro={filtro} lista={lista} resumo={resumo} />;
}
