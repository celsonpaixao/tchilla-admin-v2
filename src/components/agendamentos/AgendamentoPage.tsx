"use client";
import { useState, useTransition } from "react";
import { Calendar, Table, LayoutGrid, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { ReservaInterface, ReservaStatus } from "@/types/reserva.types";
import { RESERVA_STATUS_CODE } from "@/types/reserva.types";
import { atualizarStatusReserva } from "@/actions/reserva.actions";
import { StatusBadge } from "@/components/global/StatusBadge";
import { GlobalTable } from "@/components/global/GlobalTable";
import { GlobalDrawer } from "@/components/global/GlobalDrawer";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { GlobalUserAvatarName } from "@/components/global/GlobalAvatar";
import { PageShell } from "@/components/global/PageShell";
import { formatCurrencyAOA, formatDate, cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

type ViewMode = "table" | "cards";

interface AgendamentoPageProps {
  initialReservas: ReservaInterface[];
}

export function AgendamentoPage({ initialReservas }: AgendamentoPageProps) {
  const [reservas, setReservas] = useState(initialReservas);
  const [view, setView] = useState<ViewMode>("table");
  const [selected, setSelected] = useState<ReservaInterface | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: number; status: number; label: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReservaStatus | "">("");
  const [isPending, startTransition] = useTransition();

  const filtered = statusFilter
    ? reservas.filter((r) => r.status === statusFilter)
    : reservas;

  function handleAction(reserva: ReservaInterface, statusCode: number, label: string) {
    setConfirmAction({ id: reserva.id, status: statusCode, label });
    setDrawerOpen(false);
  }

  function confirmUpdate() {
    if (!confirmAction) return;
    startTransition(async () => {
      const result = await atualizarStatusReserva({ id: confirmAction.id, status: confirmAction.status });
      if (result.success) {
        toast.success(`Reserva ${confirmAction.label.toLowerCase()}!`);
        setReservas((prev) =>
          prev.map((r) =>
            r.id === confirmAction.id
              ? { ...r, status: Object.entries(RESERVA_STATUS_CODE).find(([, v]) => v === confirmAction.status)?.[0] as ReservaStatus ?? r.status }
              : r
          )
        );
      } else {
        toast.error(result.error ?? "Erro ao atualizar.");
      }
      setConfirmAction(null);
    });
  }

  const columns: ColumnDef<ReservaInterface, unknown>[] = [
    {
      id: "cliente",
      header: "Cliente",
      cell: ({ row }) => (
        <GlobalUserAvatarName
          name={row.original.cliente.nome}
          photo={row.original.cliente.foto}
          subtitle={row.original.cliente.email}
        />
      ),
    },
    {
      accessorKey: "tipoEvento",
      header: "Tipo",
    },
    {
      accessorKey: "local",
      header: "Local",
      cell: ({ getValue }) => (
        <span className="truncate max-w-[160px] block" title={getValue() as string}>
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "dataInicio",
      header: "Data",
      cell: ({ getValue }) => formatDate(getValue() as string, "dd/MM/yy"),
    },
    {
      accessorKey: "precoTotal",
      header: "Valor",
      cell: ({ getValue }) => formatCurrencyAOA(getValue() as number),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge status={getValue() as ReservaStatus} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => { setSelected(row.original); setDrawerOpen(true); }}
          className="text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
          style={{ background: "var(--gray-100)", color: "var(--text-2)" }}
        >
          Ver
        </button>
      ),
    },
  ];

  return (
    <PageShell
      title="Reservas"
      subtitle={`${filtered.length} reservas`}
      actions={
        <>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReservaStatus | "")}
            style={{
              height: "var(--control-h)", padding: "0 var(--pad-x)",
              borderRadius: "var(--r-md)", border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text)",
              fontSize: "var(--font-sm)", outline: "none", cursor: "pointer",
            }}
          >
            <option value="">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Concluido">Concluído</option>
          </select>

          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {([["table", Table], ["cards", LayoutGrid]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                style={{
                  height: "var(--control-h)", padding: "0 10px",
                  cursor: "pointer", transition: "background .12s",
                  background: view === mode ? "var(--blue)" : "var(--surface)",
                  color: view === mode ? "white" : "var(--text-3)",
                  border: "none",
                }}
                aria-pressed={view === mode}
                aria-label={mode === "table" ? "Visão tabela" : "Visão cards"}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </>
      }
    >

      {/* Visão Tabela */}
      {view === "table" && (
        <GlobalTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Buscar reserva…"
          isLoading={false}
          emptyMessage="Nenhuma reserva encontrada."
        />
      )}

      {/* Visão Cards */}
      {view === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm" style={{ color: "var(--text-3)" }}>Nenhuma reserva.</p>
            </div>
          ) : (
            filtered.map((reserva) => (
              <div
                key={reserva.id}
                className="card p-4 space-y-3 cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => { setSelected(reserva); setDrawerOpen(true); }}
              >
                <div className="flex items-start justify-between gap-2">
                  <GlobalUserAvatarName name={reserva.cliente.nome} photo={reserva.cliente.foto} />
                  <StatusBadge status={reserva.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{reserva.tipoEvento}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{reserva.local}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {formatCurrencyAOA(reserva.precoTotal)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {formatDate(reserva.dataInicio)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Drawer */}
      <GlobalDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`Reserva #${selected?.id}`}
        description={selected?.tipoEvento}
        footer={
          selected?.status === "Pendente" ? (
            <div className="flex gap-2 w-full">
              <button
                onClick={() => handleAction(selected, RESERVA_STATUS_CODE.Cancelado, "Cancelado")}
                className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{ background: "var(--danger-bg)", color: "var(--danger-fg)" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAction(selected, RESERVA_STATUS_CODE.Confirmado, "Confirmado")}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
                style={{ background: "var(--blue)" }}
              >
                Aceitar
              </button>
            </div>
          ) : selected?.status === "Confirmado" ? (
            <button
              onClick={() => handleAction(selected, RESERVA_STATUS_CODE.Concluido, "Concluído")}
              className="w-full py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
              style={{ background: "var(--success)" }}
            >
              Marcar como Concluído
            </button>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-5">
            <GlobalUserAvatarName
              name={selected.cliente.nome}
              photo={selected.cliente.foto}
              subtitle={selected.cliente.telefone}
              size="md"
            />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Status", value: <StatusBadge status={selected.status} /> },
                { label: "Valor", value: formatCurrencyAOA(selected.precoTotal) },
                { label: "Início", value: formatDate(selected.dataInicio) },
                { label: "Fim", value: formatDate(selected.dataFim) },
                { label: "Capacidade", value: `${selected.capacidade} pessoas` },
                { label: "Pago", value: selected.pago ? "Sim" : "Não" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-3)" }}>{item.label}</p>
                  <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--text-3)" }}>Local</p>
              <p className="text-sm" style={{ color: "var(--text)" }}>{selected.local}</p>
            </div>
            {selected.servicos.length > 0 && (
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--text-3)" }}>Serviços</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.servicos.map((s) => (
                    <span key={s.id} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}>
                      {s.nome}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </GlobalDrawer>

      <ConfirmModal
        open={!!confirmAction}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title={`${confirmAction?.label} reserva?`}
        onConfirm={confirmUpdate}
        loading={isPending}
        confirmLabel={confirmAction?.label ?? "Confirmar"}
        confirmVariant={confirmAction?.status === RESERVA_STATUS_CODE.Cancelado ? "danger" : "primary"}
      />
    </PageShell>
  );
}
