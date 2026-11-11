"use client";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { AuditoriaAdmin, FiltroAuditoriaAdmin, UsuarioAdmin } from "@/types/admin.types";
import { GlobalTable } from "@/components/global/GlobalTable";
import { PageShell } from "@/components/global/PageShell";
import { ErroCarregamento, FilterTabs, ToolbarSelect } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import {
  CampoPesquisa, CamposPeriodo, DataCurta, Etiqueta, LinkInterno, Mono, Pessoa, Vazio, usePesquisaServidor,
} from "@/components/admin/AdminUI";
import { ROUTES } from "@/constants/routes";
import { TABS_AUDITORIA, type TabAuditoria } from "./filtros";

interface AuditoriaPageProps {
  tab: TabAuditoria;
  filtro: FiltroAuditoriaAdmin;
  lista: ActionResult<Paginado<AuditoriaAdmin>>;
  equipa: UsuarioAdmin[];
  recursos: string[];
}

const NOMES_RECURSO: Record<string, string> = {
  Admin: "Plataforma",
  Agencia: "Parceiros",
  Auth: "Contas da equipa",
  Avaliacao: "Avaliações",
  Categoria: "Categorias",
  Cupom: "Cupões",
  Local: "Espaços",
  Notificacao: "Notificações",
  Payment: "Pagamentos",
  Prestador: "Prestadores",
  Promocao: "Promoções",
  Reserva: "Reservas",
  SubCategoria: "Subcategorias",
  Supervisor: "Equipa",
  Usuario: "Contas",
};

/** Como mostrar cada ID guardado no alvo, e para onde levar. */
const ALVOS: Record<string, { nome: string; href?: (id: string) => string }> = {
  reservaId: { nome: "Reserva", href: (id) => ROUTES.RESERVAS.DETALHE(Number(id)) },
  usuarioId: { nome: "Conta", href: (id) => ROUTES.USUARIOS.DETALHE(Number(id)) },
  userId: { nome: "Conta", href: (id) => ROUTES.USUARIOS.DETALHE(Number(id)) },
  espacoId: { nome: "Espaço", href: (id) => `${ROUTES.GESTAO.ESPACOS}?q=${id}` },
  pagamentoId: { nome: "Pagamento", href: (id) => `${ROUTES.FINANCEIRO.PAGAMENTOS}?q=${id}` },
  agenciaId: { nome: "Parceiro" },
  reviewId: { nome: "Avaliação" },
  comissaoId: { nome: "Comissão" },
  status: { nome: "Estado" },
  estado: { nome: "Estado" },
  id: { nome: "Nº" },
};

function Alvo({ alvo }: { alvo: Record<string, string> }) {
  const chaves = Object.keys(alvo);
  if (chaves.length === 0) return <span style={{ color: "var(--text-3)" }}>—</span>;
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
      {chaves.map((k) => {
        const def = ALVOS[k];
        const valor = alvo[k];
        const numero = /^\d+$/.test(valor);
        return (
          <span key={k} style={{ color: "var(--text-2)" }}>
            {def?.nome ?? k}{" "}
            {def?.href && numero ? <LinkInterno href={def.href(valor)}><Mono>#{valor}</Mono></LinkInterno> : numero ? <Mono>#{valor}</Mono> : <span style={{ color: "var(--text)" }}>{valor}</span>}
          </span>
        );
      })}
    </span>
  );
}

export function AuditoriaPage({ tab, filtro, lista, equipa, recursos }: AuditoriaPageProps) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pesquisa, setPesquisa] = usePesquisaServidor(filtro.alvoId ? String(filtro.alvoId) : undefined, atualizar, queryAtual);
  const [linhas, setLinhas] = useState<AuditoriaAdmin[]>(lista.success ? lista.data.data : []);
  useEffect(() => setLinhas(lista.success ? lista.data.data : []), [lista]);

  const pagina = lista.success ? lista.data : null;
  const comFiltros = !!(tab !== "todas" || filtro.usuarioId || filtro.recurso || filtro.alvoId || filtro.de || filtro.ate);
  const pesquisaInvalida = pesquisa.trim() !== "" && !/^\d+$/.test(pesquisa.trim());

  const columns: ColumnDef<AuditoriaAdmin, unknown>[] = [
    { accessorKey: "criadoEm", header: "Quando", cell: ({ row }) => <DataCurta valor={row.original.criadoEm} comHora /> },
    {
      id: "membro",
      header: "Quem",
      cell: ({ row }) => (
        <div>
          <Pessoa pessoa={row.original.membro} href={row.original.membro ? ROUTES.USUARIOS.DETALHE(row.original.membro.id) : undefined} />
          {row.original.papel && <p className="text-xs" style={{ color: "var(--text-3)" }}>{row.original.papel}</p>}
        </div>
      ),
    },
    {
      id: "acao",
      header: "O que fez",
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="min-w-0 max-w-[320px]">
            <p style={{ color: "var(--text)" }}>{a.descricao ?? `${NOMES_RECURSO[a.recurso] ?? a.recurso} · ${a.acao.split(".")[1] ?? a.acao}`}</p>
            <p className="text-xs truncate" style={{ color: "var(--text-3)" }} title={`${a.metodo} ${a.caminho}`}>
              <Mono>{a.metodo} {a.caminho}</Mono>
            </p>
          </div>
        );
      },
    },
    { id: "alvo", header: "Sobre", cell: ({ row }) => <Alvo alvo={row.original.alvo} /> },
    {
      id: "resultado",
      header: "Resultado",
      cell: ({ row }) =>
        row.original.sucesso
          ? <Etiqueta tom="sucesso">Feita</Etiqueta>
          : (
            <span title={`Resposta ${row.original.estadoHttp}`}>
              <Etiqueta tom={row.original.estadoHttp >= 500 ? "perigo" : "aviso"}>
                {row.original.estadoHttp >= 500 ? "Erro do servidor" : "Recusada"} · {row.original.estadoHttp}
              </Etiqueta>
            </span>
          ),
    },
  ];

  return (
    <PageShell
      title="Auditoria"
      subtitle="O que a equipa fez no painel: aprovações, suspensões, cancelamentos, alterações e exportações. Os conteúdos dos pedidos não ficam guardados."
    >
      <FilterTabs tabs={TABS_AUDITORIA} ativa={tab} onChange={(id) => atualizar({ tab: id === "todas" ? undefined : id })} />

      {!lista.success ? (
        <ErroCarregamento mensagem={lista.error} onRetry={recarregar} />
      ) : (
        <GlobalTable
          data={linhas}
          columns={columns}
          isLoading={isPending}
          emptyMessage={
            <Vazio
              mensagem={comFiltros
                ? "Nenhuma ação corresponde a estes filtros."
                : "Ainda não há ações registadas. Cada aprovação, suspensão, cancelamento ou exportação da equipa passa a aparecer aqui."}
              onLimpar={comFiltros ? () => { setPesquisa(""); atualizar({ tab: undefined, membro: undefined, recurso: undefined, q: undefined, de: undefined, ate: undefined }); } : undefined}
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
              <div>
                <CampoPesquisa valor={pesquisa} onChange={setPesquisa} placeholder="Nº da reserva, conta, espaço…" rotulo="Procurar por número" />
                {pesquisaInvalida && <p className="text-xs mt-1" style={{ color: "var(--warning-fg)" }}>Escreve só o número.</p>}
              </div>
              <ToolbarSelect aria-label="Membro da equipa" value={filtro.usuarioId ?? ""} onChange={(e) => atualizar({ membro: e.target.value || undefined })}>
                <option value="">Toda a equipa</option>
                {equipa.map((m) => <option key={m.id} value={m.id}>{m.nome?.trim() || `#${m.id}`}{m.papel ? ` (${m.papel})` : ""}</option>)}
              </ToolbarSelect>
              <ToolbarSelect aria-label="Área" value={filtro.recurso ?? ""} onChange={(e) => atualizar({ recurso: e.target.value || undefined })}>
                <option value="">Todas as áreas</option>
                {recursos.map((r) => <option key={r} value={r}>{NOMES_RECURSO[r] ?? r}</option>)}
              </ToolbarSelect>
              <CamposPeriodo de={filtro.de} ate={filtro.ate} onChange={(m) => atualizar(m)} />
            </div>
          }
        />
      )}
    </PageShell>
  );
}
