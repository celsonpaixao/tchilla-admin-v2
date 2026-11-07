"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, CalendarDays, Clock, Wallet } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { FiltroReservasAdmin, ReservaAdminLinha, ResumoReservasAdmin } from "@/types/admin.types";
import { GlobalTable } from "@/components/global/GlobalTable";
import { StatusBadge } from "@/components/global/StatusBadge";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { ErroCarregamento, FilterTabs, ToolbarSelect } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { Kz, kzCompacto } from "@/components/pagamentos/FinanceiroUI";
import {
  BotaoExportar, CampoPesquisa, CamposPeriodo, DataCurta, Etiqueta, LinkInterno, Mono, NOMES_ALVO,
  Parceiros, Pessoa, Vazio, usePesquisaServidor,
} from "@/components/admin/AdminUI";
import { ROUTES } from "@/constants/routes";
import { TABS_RESERVAS, queryExportacao, type TabReservas } from "./filtros";

interface ReservasListaPageProps {
  tab: TabReservas;
  filtro: FiltroReservasAdmin;
  lista: ActionResult<Paginado<ReservaAdminLinha>>;
  resumo: ActionResult<ResumoReservasAdmin>;
  /** Histórico: eventos que já aconteceram (por omissão, até ontem). */
  historico?: boolean;
}

function referente(r: ReservaAdminLinha) {
  if (r.espaco) return r.espaco.nome?.trim() || `Espaço #${r.espaco.id}`;
  const partes = [];
  if (r.quantidadeServicos) partes.push(`${r.quantidadeServicos} ${r.quantidadeServicos === 1 ? "serviço" : "serviços"}`);
  if (r.quantidadeCombos) partes.push(`${r.quantidadeCombos} ${r.quantidadeCombos === 1 ? "combo" : "combos"}`);
  return partes.join(" + ") || "Sem itens";
}

export function ReservasListaPage({ tab, filtro, lista, resumo, historico }: ReservasListaPageProps) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pesquisa, setPesquisa] = usePesquisaServidor(filtro.pesquisa, atualizar, queryAtual);
  const [linhas, setLinhas] = useState<ReservaAdminLinha[]>(lista.success ? lista.data.data : []);

  useEffect(() => setLinhas(lista.success ? lista.data.data : []), [lista]);

  const pagina = lista.success ? lista.data : null;
  const r = resumo.success ? resumo.data : null;
  const porEstado = (estado: string) => r?.porEstado.find((e) => e.chave === estado)?.quantidade ?? 0;
  const comFiltros = !!(filtro.tipo || filtro.pago !== undefined || filtro.de || (!historico && filtro.ate) || filtro.pesquisa || filtro.agenciaId || filtro.clienteId);
  const base = historico ? ROUTES.RESERVAS.HISTORICO : ROUTES.RESERVAS.LISTAGEM;

  function limpar() {
    setPesquisa("");
    atualizar({ tipo: undefined, pago: undefined, de: undefined, ate: undefined, q: undefined, agencia: undefined, cliente: undefined });
  }

  const columns: ColumnDef<ReservaAdminLinha, unknown>[] = [
    {
      accessorKey: "id",
      header: "Nº",
      cell: ({ row }) => (
        <LinkInterno href={`${ROUTES.RESERVAS.DETALHE(row.original.id)}?voltar=${encodeURIComponent(base)}`}>
          <Mono>#{row.original.id}</Mono>
        </LinkInterno>
      ),
    },
    {
      id: "cliente",
      header: "Cliente",
      cell: ({ row }) => (
        <Pessoa pessoa={row.original.cliente} href={row.original.cliente ? ROUTES.USUARIOS.DETALHE(row.original.cliente.id) : undefined} />
      ),
    },
    {
      id: "referente",
      header: "Reservado",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[200px]">
          <p className="truncate" style={{ color: "var(--text)" }} title={referente(row.original)}>{referente(row.original)}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            {NOMES_ALVO[row.original.tipo] ?? "—"}{row.original.tipoEvento ? ` · ${row.original.tipoEvento}` : ""}
          </p>
        </div>
      ),
    },
    {
      id: "parceiros",
      header: "Parceiro",
      cell: ({ row }) => <Parceiros lista={row.original.parceiros} />,
    },
    {
      accessorKey: "dataInicio",
      header: "Evento",
      cell: ({ row }) => <DataCurta valor={row.original.dataInicio} comHora />,
    },
    {
      accessorKey: "valorTotal",
      header: () => <span className="block w-full text-right">Valor</span>,
      cell: ({ row }) => <Kz valor={row.original.valorTotal} forte />,
    },
    {
      accessorKey: "pago",
      header: "Pagamento",
      cell: ({ row }) => (row.original.pago ? <Etiqueta tom="sucesso">Pago</Etiqueta> : <Etiqueta tom="aviso">Por pagar</Etiqueta>),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => <StatusBadge status={row.original.estado} />,
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <Link
          href={`${ROUTES.RESERVAS.DETALHE(row.original.id)}?voltar=${encodeURIComponent(base)}`}
          className="text-xs px-2.5 py-1 rounded-lg"
          style={{ background: "var(--gray-100)", color: "var(--text-2)" }}
          aria-label={`Abrir a reserva #${row.original.id}`}
        >
          Abrir
        </Link>
      ),
    },
  ];

  const porPagar = r ? kzCompacto(r.porPagar.valor) : null;
  const pagas = r ? kzCompacto(r.pagas.valor) : null;
  const titulo = historico ? "Histórico de reservas" : "Reservas";

  return (
    <PageShell
      title={titulo}
      subtitle={
        pagina
          ? `${pagina.totalItems} ${pagina.totalItems === 1 ? "reserva" : "reservas"}${historico ? ` com evento até ${filtro.ate?.split("-").reverse().join("/")}` : ""}`
          : undefined
      }
      actions={<BotaoExportar recurso="reservas" query={queryExportacao({ ...filtro, pageNumber: undefined, pageSize: undefined })} />}
    >
      {r ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label={`Reservas · ${r.total.quantidade}`} value={kzCompacto(r.total.valor).valor} suffix={kzCompacto(r.total.valor).sufixo} icon={<CalendarDays size={16} />} />
          <KPICard label={`Por pagar · ${r.porPagar.quantidade}`} value={porPagar!.valor} suffix={porPagar!.sufixo} icon={<Clock size={16} />} />
          <KPICard label={`Pagas · ${r.pagas.quantidade}`} value={pagas!.valor} suffix={pagas!.sufixo} icon={<Wallet size={16} />} />
          <KPICard label="Eventos nos próximos 7 dias" value={r.proximosSeteDias} icon={<CalendarClock size={16} />} />
        </div>
      ) : (
        !resumo.success && <ErroCarregamento mensagem={resumo.error} onRetry={recarregar} />
      )}

      <FilterTabs
        tabs={TABS_RESERVAS}
        ativa={tab}
        onChange={(id) => atualizar({ tab: id === "todas" ? undefined : id })}
        contadores={r && !historico ? { pendentes: porEstado("Pendente") } : undefined}
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
              mensagem={
                comFiltros
                  ? "Nenhuma reserva corresponde a estes filtros. Ajusta o tipo, o período ou a pesquisa."
                  : historico
                    ? "Ainda não há eventos passados neste estado."
                    : "Ainda não há reservas neste estado. Quando um cliente reservar, aparece aqui."
              }
              onLimpar={comFiltros ? limpar : undefined}
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
              <CampoPesquisa
                valor={pesquisa}
                onChange={setPesquisa}
                placeholder="Nº, cliente, email, telefone ou espaço"
                rotulo="Pesquisar reservas"
              />
              <ToolbarSelect aria-label="Tipo de reserva" value={filtro.tipo ?? ""} onChange={(e) => atualizar({ tipo: e.target.value || undefined })}>
                <option value="">Todos os tipos</option>
                <option value="espaco">Com espaço</option>
                <option value="servico">Com serviços</option>
                <option value="combo">Com combo</option>
              </ToolbarSelect>
              <ToolbarSelect
                aria-label="Pagamento"
                value={filtro.pago === true ? "sim" : filtro.pago === false ? "nao" : ""}
                onChange={(e) => atualizar({ pago: e.target.value || undefined })}
              >
                <option value="">Pagas e por pagar</option>
                <option value="sim">Só pagas</option>
                <option value="nao">Só por pagar</option>
              </ToolbarSelect>
              <ToolbarSelect aria-label="Ordenar por" value={filtro.ordem ?? "recentes"} onChange={(e) => atualizar({ ordem: e.target.value === "recentes" && !historico ? undefined : e.target.value })}>
                <option value="recentes">Mais recentes</option>
                <option value="data">Data do evento</option>
                <option value="valor">Maior valor</option>
              </ToolbarSelect>
              <CamposPeriodo rotulo="Evento" de={filtro.de} ate={filtro.ate} onChange={(m) => atualizar(m)} />
              {(filtro.agenciaId || filtro.clienteId) && (
                <button
                  className="text-xs font-semibold cursor-pointer"
                  style={{ color: "var(--blue-700)" }}
                  onClick={() => atualizar({ agencia: undefined, cliente: undefined })}
                >
                  {filtro.agenciaId ? `Parceiro #${filtro.agenciaId}` : `Cliente #${filtro.clienteId}`} · remover
                </button>
              )}
            </div>
          }
        />
      )}
    </PageShell>
  );
}
