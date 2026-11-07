"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { BadgeCheck, CalendarCheck, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { FiltroUsuariosAdmin, ResumoUsuariosAdmin, UsuarioAdmin } from "@/types/admin.types";
import { deletarCliente } from "@/actions/cliente.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { GlobalUserAvatarName } from "@/components/global/GlobalAvatar";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { ErroCarregamento, FilterTabs, ToolbarSelect } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { CampoPesquisa, CamposPeriodo, DataCurta, Etiqueta, Numero, Vazio, usePesquisaServidor } from "@/components/admin/AdminUI";
import { ROUTES } from "@/constants/routes";
import { TABS_USUARIOS, type TabUsuarios } from "./filtros";

interface ClientesPageProps {
  tab: TabUsuarios;
  filtro: FiltroUsuariosAdmin;
  lista: ActionResult<Paginado<UsuarioAdmin>>;
  resumo: ActionResult<ResumoUsuariosAdmin>;
  /** O utilizador ligado é Admin (apagar contas exige Admin). */
  podeApagar: boolean;
}

const NOME_TIPO: Record<string, string> = { cliente: "Cliente", parceiro: "Parceiro", equipa: "Equipa" };

export function ClientesPage({ tab, filtro, lista, resumo, podeApagar }: ClientesPageProps) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pesquisa, setPesquisa] = usePesquisaServidor(filtro.pesquisa, atualizar, queryAtual);
  const [linhas, setLinhas] = useState<UsuarioAdmin[]>(lista.success ? lista.data.data : []);
  const [apagarAlvo, setApagarAlvo] = useState<UsuarioAdmin | null>(null);
  const [aGravar, startGravar] = useTransition();

  useEffect(() => setLinhas(lista.success ? lista.data.data : []), [lista]);

  const pagina = lista.success ? lista.data : null;
  const r = resumo.success ? resumo.data : null;
  const clientes = r?.porTipo.find((t) => t.chave === "cliente")?.quantidade ?? 0;
  const comFiltros = !!(filtro.pesquisa || filtro.de || filtro.ate);

  function apagar() {
    if (!apagarAlvo) return;
    const alvo = apagarAlvo;
    startGravar(async () => {
      const res = await deletarCliente(alvo.id);
      if (!res.success) {
        toast.error("Não foi possível apagar a conta", { description: res.error });
        return;
      }
      setApagarAlvo(null);
      toast.success(`Conta de ${alvo.nome ?? `#${alvo.id}`} apagada`, { description: "Passa para o separador Apagados." });
      recarregar();
    });
  }

  const columns: ColumnDef<UsuarioAdmin, unknown>[] = [
    {
      id: "nome",
      header: "Utilizador",
      cell: ({ row }) => (
        <Link href={ROUTES.USUARIOS.DETALHE(row.original.id)} className="block min-w-0" aria-label={`Abrir a ficha de ${row.original.nome ?? row.original.id}`}>
          <GlobalUserAvatarName name={row.original.nome || `#${row.original.id}`} photo={row.original.foto} subtitle={row.original.email ?? undefined} />
        </Link>
      ),
    },
    { accessorKey: "telefone", header: "Telefone", cell: ({ getValue }) => (getValue() as string) || "—" },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 flex-wrap">
          <Etiqueta tom={row.original.tipo === "equipa" ? "info" : "neutro"}>{NOME_TIPO[row.original.tipo]}</Etiqueta>
          {row.original.google && <Etiqueta>Google</Etiqueta>}
        </span>
      ),
    },
    {
      accessorKey: "verificado",
      header: "Conta",
      cell: ({ row }) =>
        row.original.apagado ? <Etiqueta tom="perigo">Apagada</Etiqueta> :
        row.original.verificado ? <Etiqueta tom="sucesso">Verificada</Etiqueta> :
        <Etiqueta tom="aviso">Por verificar</Etiqueta>,
    },
    {
      accessorKey: "reservas",
      header: () => <span className="block w-full text-right">Reservas</span>,
      cell: ({ getValue }) => <Numero valor={getValue() as number} />,
    },
    { accessorKey: "criadoEm", header: "Registo", cell: ({ getValue }) => <DataCurta valor={getValue() as string} /> },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) =>
        podeApagar && !row.original.apagado && row.original.tipo === "cliente" ? (
          <button
            onClick={() => setApagarAlvo(row.original)}
            className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ color: "var(--danger-fg)" }}
            aria-label={`Apagar a conta de ${row.original.nome ?? row.original.id}`}
            title="Apagar conta"
          >
            <Trash2 size={14} />
          </button>
        ) : null,
    },
  ];

  return (
    <PageShell
      title="Clientes"
      subtitle={pagina ? `${pagina.totalItems} ${pagina.totalItems === 1 ? "conta" : "contas"}` : undefined}
    >
      {r ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label="Clientes ativos" value={clientes} icon={<Users size={16} />} />
          <KPICard label="Registos este mês" value={r.novos} icon={<UserPlus size={16} />} />
          <KPICard label="Contas verificadas (todos os tipos)" value={r.verificados} suffix={`de ${r.total}`} icon={<BadgeCheck size={16} />} />
          <KPICard label="Com pelo menos uma reserva" value={r.comReservas} icon={<CalendarCheck size={16} />} />
        </div>
      ) : (
        !resumo.success && <ErroCarregamento mensagem={resumo.error} onRetry={recarregar} />
      )}

      <FilterTabs
        tabs={TABS_USUARIOS}
        ativa={tab}
        onChange={(id) => atualizar({ tab: id === "ativos" ? undefined : id })}
        contadores={r ? { apagados: r.apagados } : undefined}
      />

      {!lista.success ? (
        <ErroCarregamento mensagem={lista.error} onRetry={recarregar} />
      ) : (
        <GlobalTable
          data={linhas}
          columns={columns}
          isLoading={isPending}
          emptyMessage={
            <Vazio
              mensagem={comFiltros ? "Nenhuma conta corresponde a esta pesquisa ou período." : tab === "apagados" ? "Não há contas apagadas." : "Ainda não há contas deste tipo."}
              onLimpar={comFiltros ? () => { setPesquisa(""); atualizar({ q: undefined, de: undefined, ate: undefined }); } : undefined}
            />
          }
          serverPagination={{
            page: pagina!.pageNumber,
            pageSize: pagina!.pageSize,
            totalItems: pagina!.totalItems,
            totalPages: pagina!.totalPages,
            onPageChange: (p) => atualizar({ pagina: p > 1 ? p : undefined }),
          }}
          toolbar={
            <div className="flex flex-wrap items-center gap-2 w-full">
              <CampoPesquisa valor={pesquisa} onChange={setPesquisa} placeholder="Nome, email, telefone ou nº" rotulo="Pesquisar utilizadores" />
              <ToolbarSelect aria-label="Tipo de conta" value={filtro.tipo ?? "todos"} onChange={(e) => atualizar({ tipo: e.target.value === "cliente" ? undefined : e.target.value })}>
                <option value="cliente">Só clientes</option>
                <option value="parceiro">Só parceiros</option>
                <option value="equipa">Só equipa</option>
                <option value="todos">Todos os tipos</option>
              </ToolbarSelect>
              <ToolbarSelect aria-label="Ordenar por" value={filtro.ordem ?? "recentes"} onChange={(e) => atualizar({ ordem: e.target.value === "recentes" ? undefined : e.target.value })}>
                <option value="recentes">Registo mais recente</option>
                <option value="nome">Nome</option>
                <option value="reservas">Mais reservas</option>
              </ToolbarSelect>
              <CamposPeriodo rotulo="Registo" de={filtro.de} ate={filtro.ate} onChange={(m) => atualizar(m)} />
            </div>
          }
        />
      )}

      <ConfirmModal
        open={!!apagarAlvo}
        onOpenChange={(o) => !o && setApagarAlvo(null)}
        title={apagarAlvo ? `Apagar a conta de ${apagarAlvo.nome ?? `#${apagarAlvo.id}`}?` : ""}
        description={
          apagarAlvo
            ? `A conta deixa de poder entrar na app. As ${apagarAlvo.reservas} reservas e os pagamentos ficam guardados. Só um Admin o pode fazer.`
            : ""
        }
        onConfirm={apagar}
        loading={aGravar}
        confirmLabel="Sim, apagar conta"
      />
    </PageShell>
  );
}
