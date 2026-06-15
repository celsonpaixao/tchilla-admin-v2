"use client";
import { useState, useTransition } from "react";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { AgenciaData } from "@/types/agencia.types";
import { deletarAgencia } from "@/actions/agencia.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { GlobalUserAvatarName } from "@/components/global/GlobalAvatar";
import { PageShell } from "@/components/global/PageShell";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

interface ParceirosPageProps {
  initialAgencias: AgenciaData[];
}

export function ParceirosPage({ initialAgencias }: ParceirosPageProps) {
  const [agencias, setAgencias] = useState(initialAgencias);
  const [deleteTarget, setDeleteTarget] = useState<AgenciaData | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deletarAgencia(deleteTarget.id);
      if (result.success) {
        toast.success("Parceiro removido.");
        setAgencias((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error(result.error ?? "Erro ao remover.");
      }
    });
  }

  const columns: ColumnDef<AgenciaData, unknown>[] = [
    {
      id: "nome",
      header: "Parceiro",
      cell: ({ row }) => (
        <GlobalUserAvatarName
          name={row.original.usuario.nome}
          photo={row.original.usuario.foto}
          subtitle={row.original.nomeComercial ?? row.original.usuario.email}
        />
      ),
    },
    { accessorKey: "nif", header: "NIF" },
    {
      id: "telefone",
      header: "Telefone",
      cell: ({ row }) => row.original.usuario.telefone,
    },
    {
      accessorKey: "aprovado",
      header: "Aprovado",
      cell: ({ getValue }) =>
        getValue() ? (
          <CheckCircle size={16} style={{ color: "var(--success-fg)" }} />
        ) : (
          <XCircle size={16} style={{ color: "var(--warning-fg)" }} />
        ),
    },
    {
      id: "cadastro",
      header: "Cadastro",
      cell: ({ row }) => formatDate(row.original.usuario.dataCriacao),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => setDeleteTarget(row.original)}
          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
          style={{ color: "var(--danger-fg)" }}
          aria-label="Remover parceiro"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <PageShell title="Parceiros" subtitle={`${agencias.length} parceiros cadastrados`}>
      <GlobalTable data={agencias} columns={columns} searchPlaceholder="Buscar parceiro…" emptyMessage="Nenhum parceiro encontrado." />

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remover parceiro?"
        description={`O parceiro "${deleteTarget?.usuario.nome}" será removido permanentemente.`}
        onConfirm={handleDelete}
        loading={isPending}
        confirmLabel="Remover"
      />
    </PageShell>
  );
}
