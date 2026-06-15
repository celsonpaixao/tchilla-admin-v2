import type { Metadata } from "next";
import { fetchReservas } from "@/actions/reserva.actions";
import { AgendamentoPage } from "@/components/agendamentos/AgendamentoPage";

export const metadata: Metadata = { title: "Reservas — Listagem" };

export default async function ReservasListagemPage() {
  const result = await fetchReservas();
  return <AgendamentoPage initialReservas={result.success ? result.data : []} />;
}
