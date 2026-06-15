"use client";
import { useState, useTransition } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { PagamentoInterface } from "@/types/payment.types";
import { validarPagamento } from "@/actions/payment.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { StatusBadge } from "@/components/global/StatusBadge";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { formatCurrencyAOA, formatDatetime } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

interface PaymentsPageProps {
  initialPagamentos: PagamentoInterface[];
}

export function PaymentsPage({ initialPagamentos }: PaymentsPageProps) {
  const [pagamentos, setPagamentos] = useState(initialPagamentos);
  const [tabAtiva, setTabAtiva] = useState<"todos" | "pendentes">("todos");
  const [validarTarget, setValidarTarget] = useState<PagamentoInterface | null>(null);
  const [isPending, startTransition] = useTransition();

  const dados = tabAtiva === "pendentes"
    ? pagamentos.filter((p) => p.estado === "Pendente")
    : pagamentos;

  function handleValidar() {
    if (!validarTarget) return;
    startTransition(async () => {
      const result = await validarPagamento(validarTarget.id);
      if (result.success) {
        toast.success("Pagamento validado!");
        setPagamentos((prev) => prev.map((p) => p.id === validarTarget.id ? { ...p, estado: "Confirmado" } : p));
        setValidarTarget(null);
      } else {
        toast.error(result.error ?? "Erro ao validar.");
      }
    });
  }

  const columns: ColumnDef<PagamentoInterface, unknown>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "reservaId", header: "Reserva" },
    { accessorKey: "metodoPagamento", header: "Método" },
    {
      accessorKey: "valor",
      header: "Valor",
      cell: ({ getValue }) => (
        <span className="font-semibold" style={{ color: "var(--text)" }}>
          {formatCurrencyAOA(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      accessorKey: "criadoEm",
      header: "Data",
      cell: ({ getValue }) => formatDatetime(getValue() as string),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.url && (
            <a
              href={row.original.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
              style={{ color: "var(--text-3)" }}
              aria-label="Ver comprovativo"
            >
              <ExternalLink size={14} />
            </a>
          )}
          {row.original.estado === "Pendente" && (
            <button
              onClick={() => setValidarTarget(row.original)}
              className="text-xs px-2.5 py-1 rounded-lg cursor-pointer font-medium"
              style={{ background: "var(--success-bg)", color: "var(--success-fg)" }}
            >
              Validar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Pagamentos</h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>{dados.length} pagamentos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["todos", "pendentes"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setTabAtiva(tab)}
            className="px-4 py-2.5 text-sm font-medium capitalize cursor-pointer transition-colors"
            style={{
              color: tabAtiva === tab ? "var(--blue)" : "var(--text-3)",
              borderBottom: tabAtiva === tab ? "2px solid var(--blue)" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {tab}
            {tab === "pendentes" && pagamentos.filter((p) => p.estado === "Pendente").length > 0 && (
              <span
                className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--warning-bg)", color: "var(--warning-fg)" }}
              >
                {pagamentos.filter((p) => p.estado === "Pendente").length}
              </span>
            )}
          </button>
        ))}
      </div>

      <GlobalTable
        data={dados}
        columns={columns}
        searchPlaceholder="Buscar pagamento…"
        emptyMessage="Nenhum pagamento encontrado."
      />

      <ConfirmModal
        open={!!validarTarget}
        onOpenChange={(o) => !o && setValidarTarget(null)}
        title="Validar pagamento?"
        description={`O pagamento de ${validarTarget ? formatCurrencyAOA(validarTarget.valor) : ""} será confirmado.`}
        onConfirm={handleValidar}
        loading={isPending}
        confirmLabel="Validar"
        confirmVariant="primary"
      />
    </div>
  );
}
