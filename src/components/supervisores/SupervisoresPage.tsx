"use client";
import { useState, useTransition } from "react";
import { Plus, ShieldCheck, Shield } from "lucide-react";
import { toast } from "sonner";
import type { SupervisorResponse } from "@/types/supervisor.types";
import { criarSupervisor, tornarAdmin } from "@/actions/supervisor.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { GlobalModal } from "@/components/global/GlobalModal";
import { GlobalInput } from "@/components/global/GlobalInput";
import { GlobalButton } from "@/components/global/GlobalButton";
import { PageShell } from "@/components/global/PageShell";
import type { ColumnDef } from "@tanstack/react-table";

interface SupervisoresPageProps {
  initialSupervisores: SupervisorResponse[];
}

export function SupervisoresPage({ initialSupervisores }: SupervisoresPageProps) {
  const [supervisores, setSupervisores] = useState(initialSupervisores);
  const [createOpen, setCreateOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetForm() { setUsername(""); setTelefone(""); setSenha(""); setMakeAdmin(false); }

  function handleCreate() {
    if (!username || !telefone || !senha) return;
    startTransition(async () => {
      const result = await criarSupervisor({ username, telefone, senha }, makeAdmin);
      if (result.success) {
        toast.success("Supervisor criado!");
        setSupervisores((prev) => [...prev, result.data]);
        setCreateOpen(false); resetForm();
      } else {
        toast.error(result.error ?? "Erro ao criar.");
      }
    });
  }

  function handleTornarAdmin(id: number) {
    startTransition(async () => {
      const result = await tornarAdmin(id);
      if (result.success) {
        toast.success("Promovido a Admin!");
        setSupervisores((prev) => prev.map((s) => s.id === id ? { ...s, admin: true } : s));
      } else {
        toast.error(result.error ?? "Erro ao promover.");
      }
    });
  }

  const columns: ColumnDef<SupervisorResponse, unknown>[] = [
    { accessorKey: "username", header: "Usuário" },
    { accessorKey: "telefone", header: "Telefone" },
    {
      accessorKey: "admin",
      header: "Tipo",
      cell: ({ getValue }) => {
        const isAdmin = getValue() as boolean;
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={
              isAdmin
                ? { background: "var(--info-bg)", color: "var(--info-fg)" }
                : { background: "var(--gray-100)", color: "var(--text-2)" }
            }
          >
            {isAdmin ? <ShieldCheck size={11} /> : <Shield size={11} />}
            {isAdmin ? "Admin" : "Supervisor"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        !row.original.admin ? (
          <button
            onClick={() => handleTornarAdmin(row.original.id)}
            className="text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            style={{ background: "var(--info-bg)", color: "var(--info-fg)" }}
          >
            Tornar Admin
          </button>
        ) : null,
    },
  ];

  return (
    <PageShell
      title="Supervisores"
      subtitle={`${supervisores.length} supervisores`}
      actions={
        <GlobalButton leftIcon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
          Novo Supervisor
        </GlobalButton>
      }
    >
      <GlobalTable data={supervisores} columns={columns} searchPlaceholder="Buscar supervisor…" emptyMessage="Nenhum supervisor cadastrado." />

      <GlobalModal
        open={createOpen}
        onOpenChange={(o) => { if (!o) { setCreateOpen(false); resetForm(); } }}
        title="Novo Supervisor"
        size="sm"
        footer={
          <>
            <GlobalButton variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>Cancelar</GlobalButton>
            <GlobalButton onClick={handleCreate} loading={isPending}>Criar</GlobalButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlobalInput id="sup-user" label="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="supervisor.nome" />
          <GlobalInput id="sup-tel" label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="+244 9XX XXX XXX" />
          <GlobalInput id="sup-senha" label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={makeAdmin} onChange={(e) => setMakeAdmin(e.target.checked)} className="rounded" />
            <span className="text-sm" style={{ color: "var(--text-2)" }}>Promover a Admin imediatamente</span>
          </label>
        </div>
      </GlobalModal>
    </PageShell>
  );
}
