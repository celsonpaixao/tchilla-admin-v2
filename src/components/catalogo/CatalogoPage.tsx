"use client";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type {
  ComboAdmin, CompraBilhetesAdmin, EventoAdmin, EventoAdminDetalhe, FiltroCatalogoAdmin, FiltroComprasBilhetes,
  FiltroEventosAdmin, ServicoAdmin,
} from "@/types/admin.types";
import { fetchEventoAdmin } from "@/actions/admin.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { GlobalDrawer } from "@/components/global/GlobalDrawer";
import { PageShell } from "@/components/global/PageShell";
import { StatusBadge } from "@/components/global/StatusBadge";
import { ErroCarregamento, FilterTabs, ToolbarSelect } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { Kz } from "@/components/pagamentos/FinanceiroUI";
import {
  CampoPesquisa, CamposPeriodo, Campo, DataCurta, Etiqueta, LinkInterno, Mono, Nota, Numero, Pessoa, Vazio,
  nomeParceiroResumo, usePesquisaServidor,
} from "@/components/admin/AdminUI";
import { ROUTES } from "@/constants/routes";
import { TABS_CATALOGO } from "./filtros";

export type DadosCatalogo =
  | { tab: "servicos"; filtro: FiltroCatalogoAdmin; lista: ActionResult<Paginado<ServicoAdmin>> }
  | { tab: "combos"; filtro: FiltroCatalogoAdmin; lista: ActionResult<Paginado<ComboAdmin>> }
  | { tab: "eventos"; filtro: FiltroEventosAdmin; lista: ActionResult<Paginado<EventoAdmin>> }
  | { tab: "bilhetes"; filtro: FiltroComprasBilhetes; lista: ActionResult<Paginado<CompraBilhetesAdmin>> };

const ESTADOS_COMBO: Record<string, string> = { Ativo: "Ativo", PendenteAprovacao: "Por aprovar", Inativo: "Inativo" };

function Capa({ url, nome }: { url?: string | null; nome: string }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="w-9 h-9 rounded-md object-cover flex-shrink-0" style={{ background: "var(--gray-100)" }} />
  ) : (
    <span className="w-9 h-9 rounded-md flex items-center justify-center text-xs flex-shrink-0" style={{ background: "var(--gray-100)", color: "var(--text-3)" }} aria-hidden>
      {nome.slice(0, 1).toUpperCase()}
    </span>
  );
}

function Parceiro({ id, nome }: { id?: number; nome: string }) {
  return id ? <LinkInterno href={`${ROUTES.GESTAO.CATALOGO}?agencia=${id}`} titulo="Ver só este parceiro">{nome}</LinkInterno> : <span>{nome}</span>;
}

export function CatalogoPage({ dados }: { dados: DadosCatalogo }) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pesquisa, setPesquisa] = usePesquisaServidor(dados.filtro.pesquisa, atualizar, queryAtual);
  const [evento, setEvento] = useState<{ id: number; nome: string } | null>(null);
  const [detalhe, setDetalhe] = useState<ActionResult<EventoAdminDetalhe> | null>(null);

  useEffect(() => {
    if (!evento) return;
    let ativo = true;
    setDetalhe(null);
    fetchEventoAdmin(evento.id).then((r) => ativo && setDetalhe(r));
    return () => { ativo = false; };
  }, [evento]);

  const { tab, lista } = dados;
  const pagina = lista.success ? lista.data : null;
  const agenciaId = "agenciaId" in dados.filtro ? dados.filtro.agenciaId : undefined;
  const clienteId = "clienteId" in dados.filtro ? dados.filtro.clienteId : undefined;

  function limpar() {
    setPesquisa("");
    atualizar({ q: undefined, agencia: undefined, estado: undefined, apagados: undefined, quando: undefined, de: undefined, ate: undefined, evento: undefined, cliente: undefined });
  }

  const colServicos: ColumnDef<ServicoAdmin, unknown>[] = [
    {
      id: "nome",
      header: "Serviço",
      cell: ({ row }) => {
        const s = row.original;
        const nome = s.nome?.trim() || `Serviço #${s.id}`;
        return (
          <div className="flex items-center gap-2 min-w-0 max-w-[260px]">
            <Capa url={s.capa} nome={nome} />
            <div className="min-w-0">
              <p className="font-medium truncate" style={{ color: "var(--text)" }} title={nome}>{nome}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{s.subCategoria ?? "Sem subcategoria"}{s.apagado ? " · apagado" : ""}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "parceiro",
      header: "Parceiro",
      cell: ({ row }) => row.original.parceiro
        ? <Parceiro id={row.original.parceiro.id} nome={nomeParceiroResumo(row.original.parceiro)} />
        : <Pessoa pessoa={row.original.prestador} />,
    },
    {
      accessorKey: "preco",
      header: () => <span className="block w-full text-right">Preço</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <Kz valor={row.original.preco} forte />
          <span className="text-xs" style={{ color: "var(--text-3)" }}>{row.original.tipoPreco === "PorHora" ? "por hora" : row.original.tipoPreco === "Fixo" ? "fixo" : row.original.tipoPreco}</span>
        </div>
      ),
    },
    { accessorKey: "pacotes", header: () => <span className="block w-full text-right">Pacotes</span>, cell: ({ getValue }) => <Numero valor={getValue() as number} /> },
    { accessorKey: "reservas", header: () => <span className="block w-full text-right">Reservas</span>, cell: ({ getValue }) => <Numero valor={getValue() as number} /> },
    {
      id: "avaliacao",
      header: "Avaliação",
      cell: ({ row }) => row.original.media != null
        ? <span className="flex items-center gap-1"><Nota valor={row.original.media} /><span className="text-xs" style={{ color: "var(--text-3)" }}>({row.original.avaliacoes})</span></span>
        : <span style={{ color: "var(--text-3)" }}>Sem avaliações</span>,
    },
    { accessorKey: "criadoEm", header: "Criado", cell: ({ row }) => <DataCurta valor={row.original.criadoEm} /> },
  ];

  const colCombos: ColumnDef<ComboAdmin, unknown>[] = [
    {
      id: "nome",
      header: "Combo",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[240px]">
          <p className="font-medium truncate" style={{ color: "var(--text)" }}>{row.original.nome?.trim() || `Combo #${row.original.id}`}</p>
          <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
            {row.original.espaco ? `Espaço: ${row.original.espaco}` : "Sem espaço"} · {row.original.servicos} {row.original.servicos === 1 ? "serviço" : "serviços"}
          </p>
        </div>
      ),
    },
    { id: "parceiro", header: "Parceiro", cell: ({ row }) => <Parceiro id={row.original.parceiro?.id} nome={nomeParceiroResumo(row.original.parceiro)} /> },
    { accessorKey: "preco", header: () => <span className="block w-full text-right">Preço</span>, cell: ({ row }) => <Kz valor={row.original.preco} forte /> },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const e = row.original.estado ?? "";
        return <Etiqueta tom={e === "Ativo" ? "sucesso" : e === "PendenteAprovacao" ? "aviso" : "neutro"}>{ESTADOS_COMBO[e] ?? (e || "—")}</Etiqueta>;
      },
    },
    { accessorKey: "reservas", header: () => <span className="block w-full text-right">Reservas</span>, cell: ({ getValue }) => <Numero valor={getValue() as number} /> },
    { accessorKey: "criadoEm", header: "Criado", cell: ({ row }) => <DataCurta valor={row.original.criadoEm} /> },
  ];

  const colEventos: ColumnDef<EventoAdmin, unknown>[] = [
    {
      id: "nome",
      header: "Evento",
      cell: ({ row }) => {
        const nome = row.original.nome?.trim() || `Evento #${row.original.id}`;
        return (
          <button className="flex items-center gap-2 min-w-0 max-w-[260px] text-left cursor-pointer" onClick={() => setEvento({ id: row.original.id, nome })}>
            <Capa url={row.original.banner} nome={nome} />
            <span className="min-w-0">
              <span className="block font-medium truncate" style={{ color: "var(--blue-700)" }}>{nome}</span>
              <span className="block text-xs truncate" style={{ color: "var(--text-3)" }}>{row.original.categoria ?? "Sem categoria"}{row.original.faixaEtaria ? ` · ${row.original.faixaEtaria}` : ""}</span>
            </span>
          </button>
        );
      },
    },
    {
      id: "organizador",
      header: "Organizador",
      cell: ({ row }) => row.original.agencia
        ? <Parceiro id={row.original.agencia.id} nome={nomeParceiroResumo(row.original.agencia)} />
        : <Pessoa pessoa={row.original.organizador} href={row.original.organizador ? ROUTES.USUARIOS.DETALHE(row.original.organizador.id) : undefined} />,
    },
    { accessorKey: "dataInicio", header: "Início", cell: ({ row }) => <DataCurta valor={row.original.dataInicio} comHora /> },
    { accessorKey: "bilhetesVendidos", header: () => <span className="block w-full text-right">Vendidos</span>, cell: ({ getValue }) => <Numero valor={getValue() as number} /> },
    { accessorKey: "receita", header: () => <span className="block w-full text-right">Receita</span>, cell: ({ row }) => <Kz valor={row.original.receita} forte /> },
  ];

  const colBilhetes: ColumnDef<CompraBilhetesAdmin, unknown>[] = [
    { accessorKey: "id", header: "Compra", cell: ({ row }) => <Mono>#{row.original.id}</Mono> },
    { id: "cliente", header: "Cliente", cell: ({ row }) => <Pessoa pessoa={row.original.cliente} href={row.original.cliente ? ROUTES.USUARIOS.DETALHE(row.original.cliente.id) : undefined} /> },
    {
      id: "itens",
      header: "Bilhetes",
      cell: ({ row }) => (
        <ul className="text-xs space-y-0.5 max-w-[240px]">
          {row.original.itens.map((i) => (
            <li key={i.ticketId} className="truncate" style={{ color: "var(--text-2)" }}>
              {i.quantidade} × {i.bilhete ?? `#${i.ticketId}`} <span style={{ color: "var(--text-3)" }}>· {i.evento ?? `evento #${i.eventoId}`}</span>
            </li>
          ))}
        </ul>
      ),
    },
    { accessorKey: "totalPago", header: () => <span className="block w-full text-right">Total</span>, cell: ({ row }) => <Kz valor={row.original.totalPago} forte /> },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <StatusBadge status={row.original.estado ?? "—"} /> },
    { accessorKey: "data", header: "Data", cell: ({ row }) => <DataCurta valor={row.original.data} comHora /> },
  ];

  const vazioPorTab: Record<string, string> = {
    servicos: "Ainda não há serviços publicados pelos parceiros.",
    combos: "Ainda não há combos. Os parceiros criam-nos juntando um espaço e serviços.",
    eventos: "Ainda não há eventos com bilhetes na plataforma.",
    bilhetes: "Ainda não foram comprados bilhetes.",
  };
  const comFiltros = !!(dados.filtro.pesquisa || agenciaId || clienteId || ("estado" in dados.filtro && dados.filtro.estado) || ("quando" in dados.filtro && dados.filtro.quando) || ("de" in dados.filtro && dados.filtro.de));

  const tabela = (() => {
    const comum = {
      isLoading: isPending,
      emptyMessage: <Vazio mensagem={comFiltros ? "Nada corresponde a estes filtros." : vazioPorTab[tab]} onLimpar={comFiltros ? limpar : undefined} />,
      serverPagination: pagina ? {
        page: pagina.pageNumber,
        pageSize: pagina.pageSize,
        totalItems: pagina.totalItems,
        totalPages: pagina.totalPages,
        onPageChange: (p: number) => atualizar({ pagina: p > 1 ? p : undefined }),
      } : undefined,
    };
    const toolbar = (
      <div className="flex flex-wrap items-center gap-2 w-full">
        <CampoPesquisa
          valor={pesquisa}
          onChange={setPesquisa}
          placeholder={tab === "bilhetes" ? "Nº da compra, nome ou email" : "Nome ou nº"}
          rotulo="Pesquisar no catálogo"
        />
        {tab === "combos" && (
          <ToolbarSelect aria-label="Estado do combo" value={(dados.filtro as FiltroCatalogoAdmin).estado ?? ""} onChange={(e) => atualizar({ estado: e.target.value || undefined })}>
            <option value="">Todos os estados</option>
            <option value="Ativo">Ativos</option>
            <option value="PendenteAprovacao">Por aprovar</option>
            <option value="Inativo">Inativos</option>
          </ToolbarSelect>
        )}
        {(tab === "servicos" || tab === "combos") && (
          <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-2)" }}>
            <input type="checkbox" checked={!!(dados.filtro as FiltroCatalogoAdmin).incluirApagados} onChange={(e) => atualizar({ apagados: e.target.checked ? "1" : undefined })} />
            Incluir os apagados
          </label>
        )}
        {tab === "eventos" && (
          <ToolbarSelect aria-label="Quando" value={(dados.filtro as FiltroEventosAdmin).quando ?? ""} onChange={(e) => atualizar({ quando: e.target.value || undefined })}>
            <option value="">Todos</option>
            <option value="futuros">Ainda por acontecer</option>
            <option value="passados">Já terminaram</option>
          </ToolbarSelect>
        )}
        {tab === "bilhetes" && (
          <ToolbarSelect aria-label="Estado da compra" value={(dados.filtro as FiltroComprasBilhetes).estado ?? ""} onChange={(e) => atualizar({ estado: e.target.value || undefined })}>
            <option value="">Pagas e pendentes</option>
            <option value="Pago">Pagas</option>
            <option value="Pendente">Pendentes</option>
          </ToolbarSelect>
        )}
        {(tab === "eventos" || tab === "bilhetes") && (
          <CamposPeriodo
            de={(dados.filtro as FiltroEventosAdmin).de}
            ate={(dados.filtro as FiltroEventosAdmin).ate}
            onChange={(m) => atualizar(m)}
            rotulo={tab === "eventos" ? "Início" : "Compra"}
          />
        )}
        {(agenciaId || clienteId) && (
          <button className="text-xs font-semibold cursor-pointer" style={{ color: "var(--blue-700)" }} onClick={() => atualizar({ agencia: undefined, cliente: undefined })}>
            {agenciaId ? `Parceiro #${agenciaId}` : `Cliente #${clienteId}`} · remover
          </button>
        )}
      </div>
    );
    switch (dados.tab) {
      case "servicos": return <GlobalTable data={dados.lista.success ? dados.lista.data.data : []} columns={colServicos} toolbar={toolbar} {...comum} />;
      case "combos": return <GlobalTable data={dados.lista.success ? dados.lista.data.data : []} columns={colCombos} toolbar={toolbar} {...comum} />;
      case "eventos": return <GlobalTable data={dados.lista.success ? dados.lista.data.data : []} columns={colEventos} toolbar={toolbar} {...comum} />;
      case "bilhetes": return <GlobalTable data={dados.lista.success ? dados.lista.data.data : []} columns={colBilhetes} toolbar={toolbar} {...comum} />;
    }
  })();

  const d = detalhe?.success ? detalhe.data : null;

  return (
    <PageShell
      title="Catálogo dos parceiros"
      subtitle={pagina ? `${pagina.totalItems} ${TABS_CATALOGO.find((t) => t.id === tab)?.label.toLowerCase()} · só leitura` : "Só leitura"}
    >
      <FilterTabs
        tabs={TABS_CATALOGO}
        ativa={tab}
        onChange={(id) => { setPesquisa(""); atualizar({ tab: id === "servicos" ? undefined : id, q: undefined, estado: undefined, apagados: undefined, quando: undefined, de: undefined, ate: undefined }); }}
      />

      {!lista.success ? <ErroCarregamento mensagem={lista.error} onRetry={recarregar} /> : tabela}

      <GlobalDrawer
        open={!!evento}
        onOpenChange={(o) => !o && setEvento(null)}
        title={evento?.nome}
        description={d ? `${d.categoria ?? "Evento"} · ${d.tiposBilhete} tipos de bilhete` : undefined}
        width="md"
      >
        {!detalhe ? (
          <div className="space-y-2" aria-label="A carregar o evento">
            <div className="skeleton h-4 w-2/3" /><div className="skeleton h-4 w-1/2" /><div className="skeleton h-4 w-3/4" />
          </div>
        ) : !detalhe.success ? (
          <ErroCarregamento mensagem={detalhe.error} onRetry={() => evento && setEvento({ ...evento })} />
        ) : d && (
          <div className="space-y-5">
            <dl>
              <Campo rotulo="Início"><DataCurta valor={d.dataInicio} comHora /></Campo>
              <Campo rotulo="Fim"><DataCurta valor={d.dataFim} comHora /></Campo>
              <Campo rotulo="Organizador">{d.agencia ? nomeParceiroResumo(d.agencia) : d.organizador?.nome ?? "—"}</Campo>
              <Campo rotulo="Morada">{d.morada ? [d.morada.rua, d.morada.bairro, d.morada.cidade].filter((x) => x?.trim()).join(", ") || d.morada.nome : "—"}</Campo>
              <Campo rotulo="Compras">{d.compras} pagas · {d.comprasPendentes} pendentes</Campo>
              <Campo rotulo="Avaliação">{d.media != null ? <Nota valor={d.media} /> : "Sem avaliações"}</Campo>
            </dl>
            {d.descricao && <p className="text-sm" style={{ color: "var(--text-2)" }}>{d.descricao}</p>}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-3)" }}>Bilhetes</p>
              {d.bilhetes.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-3)" }}>Este evento ainda não tem bilhetes à venda.</p>
              ) : (
                <ul className="divide-y text-sm" style={{ borderColor: "var(--border)" }}>
                  {d.bilhetes.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                      <span>
                        <span style={{ color: "var(--text)" }}>{b.nome ?? `#${b.id}`}</span>
                        <span className="block text-xs" style={{ color: "var(--text-3)" }}>{b.vendidos} vendidos · <DataCurta valor={b.data} /></span>
                      </span>
                      <span className="text-right">
                        <Kz valor={b.preco} />
                        <span className="text-xs" style={{ color: "var(--text-3)" }}>receita {b.receita.toLocaleString("pt-AO")} Kz</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <LinkInterno href={`${ROUTES.GESTAO.CATALOGO}?tab=bilhetes&evento=${d.id}`}>Ver as compras deste evento</LinkInterno>
          </div>
        )}
      </GlobalDrawer>
    </PageShell>
  );
}
