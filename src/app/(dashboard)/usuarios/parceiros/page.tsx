import type { Metadata } from "next";
import { fetchParceiros, fetchResumoParceiros } from "@/actions/agencia.actions";
import { ParceirosPage } from "@/components/parceiros/ParceirosPage";
import { filtroParceiros, tabParceiros, type SearchParams } from "@/components/parceiros/filtros";

export const metadata: Metadata = { title: "Usuários — Parceiros" };

export default async function ParceirosPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filtro = filtroParceiros(params);
  const [lista, resumo] = await Promise.all([fetchParceiros(filtro), fetchResumoParceiros()]);

  return <ParceirosPage tab={tabParceiros(params)} filtro={filtro} lista={lista} resumo={resumo} />;
}
