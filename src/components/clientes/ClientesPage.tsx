"use client";
import { useState, useTransition } from "react";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ClientesData } from "@/types/client.types";
import { deletarCliente } from "@/actions/cliente.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { GlobalUserAvatarName } from "@/components/global/GlobalAvatar";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

interface ClientesPageProps {
  initialClientes: ClientesData[];
}

export function ClientesPage({ initialClientes }: ClientesPageProps) {
  const [clientes, setClientes] = useState(initialClientes);
  const [deleteTarget, setDeleteTarget] = useState<ClientesData | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deletarCliente(deleteTarget.id);
      if (result.success) {
        toast.success("Cliente removido.");
        setClientes((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error(result.error ?? "Erro ao remover.");
      }
    });
  }

  const columns: ColumnDef<ClientesData, unknown>[] = [
    {
      id: "nome",
      header: "Cliente",
      cell: ({ row }) => (
        <GlobalUserAvatarName
          name={row.original.nome}
          photo={row.original.foto}
          subtitle={row.original.email}
        />
      ),
    },
    { accessorKey: "telefone", header: "Telefone" },
    {
      accessorKey: "verificado",
      header: "Verificado",
      cell: ({ getValue }) =>
        getValue() ? (
          <CheckCircle size={16} style={{ color: "var(--success-fg)" }} />
        ) : (
          <XCircle size={16} style={{ color: "var(--text-3)" }} />
        ),
    },
    {
      accessorKey: "dataCriacao",
      header: "Cadastro",
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => setDeleteTarget(row.original)}
          className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
          style={{ color: "var(--danger-fg)" }}
          aria-label="Remover cliente"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Clientes</h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>{clientes.length} clientes cadastrados</p>
      </div>

      <GlobalTable
        data={clientes}
        columns={columns}
        searchPlaceholder="Buscar cliente…"
        emptyMessage="Nenhum cliente encontrado."
      />

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remover cliente?"
        description={`O cliente "${deleteTarget?.nome}" será removido permanentemente.`}
        onConfirm={handleDelete}
        loading={isPending}
        confirmLabel="Remover"
      />
    </div>
  );
}
