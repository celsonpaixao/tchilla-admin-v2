import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchReservaAdmin } from "@/actions/admin.actions";
import { ReservaDetalhePage } from "@/components/reservas/ReservaDetalhePage";
import { ErroDetalhe } from "@/components/admin/ErroDetalhe";
import { inteiro, um, type SearchParams } from "@/components/admin/params";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = { title: "Reserva" };

export default async function ReservaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const id = inteiro((await params).id);
  if (!id) notFound();

  const voltar = um((await searchParams).voltar);
  const destino = voltar === ROUTES.RESERVAS.HISTORICO ? ROUTES.RESERVAS.HISTORICO : ROUTES.RESERVAS.LISTAGEM;
  const res = await fetchReservaAdmin(id);

  if (!res.success) {
    return <ErroDetalhe titulo={`Reserva #${id}`} mensagem={res.error} voltar={{ label: "Voltar às reservas", href: destino }} />;
  }
  return <ReservaDetalhePage reserva={res.data} voltar={destino} />;
}
