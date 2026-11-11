import type { Metadata } from "next";
import { fetchAvaliacoesAdmin, fetchResumoAvaliacoes } from "@/actions/admin.actions";
import { AvaliacoesPage } from "@/components/avaliacoes/AvaliacoesPage";
import { faixaNota, filtroAvaliacoes, visibilidade } from "@/components/avaliacoes/filtros";
import type { SearchParams } from "@/components/admin/params";

export const metadata: Metadata = { title: "Gestão — Avaliações" };

export default async function AvaliacoesPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filtro = filtroAvaliacoes(params);
  const [lista, resumo] = await Promise.all([
    fetchAvaliacoesAdmin(filtro),
    fetchResumoAvaliacoes({ de: filtro.de, ate: filtro.ate }),
  ]);

  return <AvaliacoesPage faixa={faixaNota(params)} visibilidade={visibilidade(params)} filtro={filtro} lista={lista} resumo={resumo} />;
}
