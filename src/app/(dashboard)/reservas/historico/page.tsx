import type { Metadata } from "next";
import { fetchReservasAdmin, fetchResumoReservas } from "@/actions/admin.actions";
import { ReservasListaPage } from "@/components/reservas/ReservasListaPage";
import { filtroReservas, tabReservas } from "@/components/reservas/filtros";
import type { SearchParams } from "@/components/admin/params";

export const metadata: Metadata = { title: "Reservas — Histórico" };

export default async function ReservasHistoricoPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filtro = filtroReservas(params, true);
  const [lista, resumo] = await Promise.all([
    fetchReservasAdmin(filtro),
    fetchResumoReservas({ de: filtro.de, ate: filtro.ate }),
  ]);

  return <ReservasListaPage tab={tabReservas(params)} filtro={filtro} lista={lista} resumo={resumo} historico />;
}
