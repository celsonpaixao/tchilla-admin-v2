"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarCheck, DollarSign, CheckCircle, XCircle, Eye, Check, X } from "lucide-react";
import type { AgendamentoMetrics } from "@/types/metrics.types";
import type { ReservaInterface } from "@/types/reserva.types";
import { RESERVA_STATUS_CODE } from "@/types/reserva.types";
import { atualizarStatusReserva, fetchReservaById } from "@/actions/reserva.actions";
import { StatusBadge } from "@/components/global/StatusBadge";
import { GlobalDrawer } from "@/components/global/GlobalDrawer";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { GlobalUserAvatarName } from "@/components/global/GlobalAvatar";
import { KPICard } from "@/components/global/KPICard";
import { PageShell } from "@/components/global/PageShell";
import { formatCurrencyAOA, formatDatetime } from "@/lib/utils";
import { ReservaDrawerContent, DrawerSkeleton } from "@/components/reservas/ReservaDrawerContent";


interface ReservaDashboardProps {
  metricas: AgendamentoMetrics | null;
  reservasPendentes: ReservaInterface[];
}

export function ReservaDashboard({ metricas, reservasPendentes: initialPendentes }: ReservaDashboardProps) {
  const [pendentes, setPendentes] = useState(initialPendentes);
  const [selected, setSelected] = useState<ReservaInterface | null>(null);
  const [detail, setDetail] = useState<ReservaInterface | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: number; status: number; label: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function openDrawer(reserva: ReservaInterface) {
    setSelected(reserva);
    setDetail(null);
    setDetailLoading(true);
    setDrawerOpen(true);
    fetchReservaById(reserva.id).then((res) => {
      if (res.success) setDetail(res.data);
      setDetailLoading(false);
    });
  }

  function handleAction(reserva: ReservaInterface, statusCode: number, label: string) {
    setConfirmAction({ id: reserva.id, status: statusCode, label });
    setDrawerOpen(false);
  }

  function confirmUpdate() {
    if (!confirmAction) return;
    startTransition(async () => {
      const result = await atualizarStatusReserva({
        id: confirmAction.id,
        status: confirmAction.status,
      });
      if (result.success) {
        toast.success(`Reserva ${confirmAction.label.toLowerCase()} com sucesso!`);
        setPendentes((prev) => prev.filter((r) => r.id !== confirmAction.id));
      } else {
        toast.error(result.error ?? "Erro ao atualizar reserva.");
      }
      setConfirmAction(null);
    });
  }

  return (
    <PageShell title="Relatório de Reservas">
      {/* KPI Cards — layout DS: grid 4 cols */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total de Reservas"
          value={metricas?.totalReservas ?? "—"}
          icon={<CalendarCheck size={16} />}
          spark
        />
        <KPICard
          label="Receita Total"
          value={metricas?.receitaTotal != null ? formatCurrencyAOA(metricas.receitaTotal) : "—"}
          icon={<DollarSign size={16} />}
          accent
          spark
        />
        <KPICard
          label="Concluídas"
          value={metricas?.reservasConcluidas ?? "—"}
          icon={<CheckCircle size={16} />}
          spark
        />
        <KPICard
          label="Canceladas"
          value={metricas?.reservasCanceladas ?? "—"}
          icon={<XCircle size={16} />}
          accent
          delta={-3}
          spark
        />
      </div>

      {/* Reservas pendentes */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Reservas Pendentes
            </h2>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              {pendentes.length} aguardando aprovação
            </p>
          </div>
          {pendentes.length > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: "var(--warning-bg)", color: "var(--warning-fg)" }}
            >
              {pendentes.length}
            </span>
          )}
        </div>

        {pendentes.length === 0 ? (
          <div
            className="py-12 text-center"
            style={{ background: "var(--surface)" }}
          >
            <CheckCircle size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              Nenhuma reserva pendente no momento
            </p>
          </div>
        ) : (
          <div style={{ background: "var(--surface)" }}>
            {pendentes.map((reserva, idx) => (
              <div
                key={reserva.id}
                className="flex items-center gap-4 px-5 py-4 transition-colors"
                style={{
                  borderTop: idx === 0 ? "none" : "1px solid var(--border)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-25)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <GlobalUserAvatarName
                  name={reserva.cliente.nome}
                  photo={reserva.cliente.foto}
                />

                <div className="flex-1 min-w-0 hidden sm:block">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>
                    {reserva.tipoEvento}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
                    {reserva.local}
                  </p>
                </div>

                <div className="hidden md:block">
                  <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                    {formatCurrencyAOA(reserva.precoTotal)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {formatDatetime(reserva.dataInicio)}
                  </p>
                </div>

                <StatusBadge status={reserva.status} />

                {/* Ações */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openDrawer(reserva)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                    style={{ color: "var(--text-3)" }}
                    title="Ver detalhes"
                    aria-label="Ver detalhes da reserva"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handleAction(reserva, RESERVA_STATUS_CODE.Confirmado, "Confirmado")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                    style={{ background: "var(--success-bg)", color: "var(--success-fg)" }}
                    title="Aceitar"
                    aria-label="Aceitar reserva"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleAction(reserva, RESERVA_STATUS_CODE.Cancelado, "Cancelado")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                    style={{ background: "var(--danger-bg)", color: "var(--danger-fg)" }}
                    title="Cancelar"
                    aria-label="Cancelar reserva"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer de detalhes */}
      <GlobalDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`Reserva #${selected?.id}`}
        description={selected?.tipoEvento}
        footer={
          selected ? (
            <div className="flex gap-2 w-full">
              <button
                onClick={() => handleAction(selected, RESERVA_STATUS_CODE.Cancelado, "Cancelado")}
                className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                style={{ background: "var(--danger-bg)", color: "var(--danger-fg)" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAction(selected, RESERVA_STATUS_CODE.Confirmado, "Confirmado")}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-colors"
                style={{ background: "var(--blue)" }}
              >
                Aceitar
              </button>
            </div>
          ) : null
        }
      >
        {detailLoading ? (
          <DrawerSkeleton />
        ) : detail ? (
          <ReservaDrawerContent reserva={detail} />
        ) : null}
      </GlobalDrawer>

      {/* Modal de confirmação */}
      <ConfirmModal
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={`${confirmAction?.label ?? "Atualizar"} reserva?`}
        description={
          confirmAction?.status === RESERVA_STATUS_CODE.Cancelado
            ? "A reserva será cancelada e o cliente será notificado."
            : "A reserva será confirmada e o cliente será notificado."
        }
        onConfirm={confirmUpdate}
        loading={isPending}
        confirmLabel={confirmAction?.label ?? "Confirmar"}
        confirmVariant={confirmAction?.status === RESERVA_STATUS_CODE.Cancelado ? "danger" : "primary"}
      />
    </PageShell>
  );
}
