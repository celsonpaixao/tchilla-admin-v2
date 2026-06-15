import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchReservasPendentes, fetchMetricasReservas } from "@/actions/reserva.actions";
import { ReservaDashboard } from "@/components/dashboard/ReservaDashboard";
import { KPISkeleton } from "@/components/global/GlobalLoading";

export const metadata: Metadata = { title: "Reservas — Relatório" };

export default async function ReservaRelatorioPage() {
  const [metricasResult, reservasResult] = await Promise.all([
    fetchMetricasReservas(),
    fetchReservasPendentes(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)}
        </div>
      }
    >
      <ReservaDashboard
        metricas={metricasResult.success ? metricasResult.data : null}
        reservasPendentes={reservasResult.success ? reservasResult.data : []}
      />
    </Suspense>
  );
}
