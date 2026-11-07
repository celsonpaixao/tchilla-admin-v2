"use client";
import { useEffect, useState } from "react";
import { MessageSquareWarning, Star, ThumbsDown, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { AvaliacaoAdmin, FiltroAvaliacoesAdmin, ResumoAvaliacoesAdmin } from "@/types/admin.types";
import { GlobalTable } from "@/components/global/GlobalTable";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { ErroCarregamento, ToolbarSelect } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import {
  CampoPesquisa, CamposPeriodo, Cartao, DataCurta, Etiqueta, LinkInterno, NOMES_ALVO, Nota, Pessoa, Vazio,
  nomeParceiroResumo, usePesquisaServidor,
} from "@/components/admin/AdminUI";
import { ROUTES } from "@/constants/routes";
import type { FaixaNota } from "./filtros";

interface AvaliacoesPageProps {
  faixa: FaixaNota;
  filtro: FiltroAvaliacoesAdmin;
  lista: ActionResult<Paginado<AvaliacaoAdmin>>;
  resumo: ActionResult<ResumoAvaliacoesAdmin>;
}

export function AvaliacoesPage({ faixa, filtro, lista, resumo }: AvaliacoesPageProps) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pesquisa, setPesquisa] = usePesquisaServidor(filtro.pesquisa, atualizar, queryAtual);
  const [linhas, setLinhas] = useState<AvaliacaoAdmin[]>(lista.success ? lista.data.data : []);
  useEffect(() => setLinhas(lista.success ? lista.data.data : []), [lista]);

  const pagina = lista.success ? lista.data : null;
  const r = resumo.success ? resumo.data : null;
  const comFiltros = !!(faixa !== "todas" || filtro.alvo || filtro.pesquisa || filtro.de || filtro.ate || filtro.usuarioId || filtro.agenciaId);

  const columns: ColumnDef<AvaliacaoAdmin, unknown>[] = [
    { accessorKey: "nota", header: "Nota", cell: ({ row }) => <Nota valor={row.original.nota} /> },
    {
      accessorKey: "mensagem",
      header: "Comentário",
      cell: ({ row }) => (
        <div className="max-w-[320px]">
          <p className="line-clamp-2" style={{ color: row.original.mensagem ? "var(--text)" : "var(--text-3)" }} title={row.original.mensagem ?? undefined}>
            {row.original.mensagem?.trim() || "Sem comentário"}
          </p>
          {row.original.apagadaEm && <Etiqueta>Apagada pelo cliente</Etiqueta>}
        </div>
      ),
    },
    {
      id: "anuncio",
      header: "Anúncio",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[200px]">
          <p className="truncate" style={{ color: "var(--text)" }}>{row.original.alvoNome?.trim() || (row.original.alvoId ? `#${row.original.alvoId}` : "—")}</p>
          <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
            {row.original.alvo ? NOMES_ALVO[row.original.alvo] : "—"}{row.original.parceiro ? ` · ${nomeParceiroResumo(row.original.parceiro)}` : ""}
          </p>
        </div>
      ),
    },
    {
      id: "cliente",
      header: "Cliente",
      cell: ({ row }) => <Pessoa pessoa={row.original.cliente} href={row.original.cliente ? ROUTES.USUARIOS.DETALHE(row.original.cliente.id) : undefined} />,
    },
    {
      id: "reserva",
      header: "Reserva",
      cell: ({ row }) => row.original.reservaId
        ? <LinkInterno href={ROUTES.RESERVAS.DETALHE(row.original.reservaId)}>#{row.original.reservaId}</LinkInterno>
        : <span style={{ color: "var(--text-3)" }}>—</span>,
    },
    { accessorKey: "criadoEm", header: "Data", cell: ({ row }) => <DataCurta valor={row.original.criadoEm} /> },
  ];

  return (
    <PageShell title="Avaliações" subtitle="O que os clientes dizem dos anúncios. Só leitura: ocultar avaliações chega na próxima fase.">
      {r ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label={`Média · ${r.total} avaliações`} value={r.total ? r.media.toLocaleString("pt-AO", { maximumFractionDigits: 2 }) : "—"} suffix={r.total ? "/ 5" : undefined} icon={<Star size={16} />} />
          <KPICard label="Negativas (1 e 2)" value={r.negativas} icon={<ThumbsDown size={16} />} />
          <KPICard label="Neutras (3)" value={r.porNota.find((n) => n.chave === "3")?.quantidade ?? 0} icon={<MessageSquareWarning size={16} />} />
          <KPICard label="Apagadas pelo cliente" value={r.apagadas} icon={<Trash2 size={16} />} />
        </div>
      ) : (
        !resumo.success && <ErroCarregamento mensagem={resumo.error} onRetry={recarregar} />
      )}

      {r && r.pioresAnuncios.length > 0 && (
        <Cartao titulo="Anúncios com pior média (2 ou mais avaliações)">
          <ul className="divide-y text-sm" style={{ borderColor: "var(--border)" }}>
            {r.pioresAnuncios.map((a) => (
              <li key={`${a.alvo}${a.alvoId}`} className="flex items-center justify-between gap-3 py-2">
                <span>
                  <span style={{ color: "var(--text)" }}>{a.nome?.trim() || `#${a.alvoId}`}</span>
                  <span className="text-xs ml-2" style={{ color: "var(--text-3)" }}>{NOMES_ALVO[a.alvo]} · {a.avaliacoes} avaliações</span>
                </span>
                <Nota valor={a.media} />
              </li>
            ))}
          </ul>
        </Cartao>
      )}

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
                ? "Nenhuma avaliação corresponde a estes filtros."
                : "Ainda não há avaliações. Aparecem aqui quando os clientes avaliarem uma reserva concluída."}
              onLimpar={comFiltros ? () => { setPesquisa(""); atualizar({ nota: undefined, alvo: undefined, q: undefined, de: undefined, ate: undefined, usuario: undefined, agencia: undefined }); } : undefined}
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
              <CampoPesquisa valor={pesquisa} onChange={setPesquisa} placeholder="Texto, nome ou email do cliente" rotulo="Pesquisar avaliações" />
              <ToolbarSelect aria-label="Nota" value={faixa} onChange={(e) => atualizar({ nota: e.target.value === "todas" ? undefined : e.target.value })}>
                <option value="todas">Todas as notas</option>
                <option value="negativas">Negativas (1–2)</option>
                <option value="neutras">Neutras (3)</option>
                <option value="positivas">Positivas (4–5)</option>
              </ToolbarSelect>
              <ToolbarSelect aria-label="Tipo de anúncio" value={filtro.alvo ?? ""} onChange={(e) => atualizar({ alvo: e.target.value || undefined })}>
                <option value="">Todos os anúncios</option>
                <option value="espaco">Espaços</option>
                <option value="servico">Serviços</option>
                <option value="combo">Combos</option>
                <option value="evento">Eventos</option>
              </ToolbarSelect>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "var(--text-2)" }}>
                <input type="checkbox" checked={!!filtro.incluirApagadas} onChange={(e) => atualizar({ apagadas: e.target.checked ? "1" : undefined })} />
                Incluir as apagadas
              </label>
              <CamposPeriodo de={filtro.de} ate={filtro.ate} onChange={(m) => atualizar(m)} />
              {(filtro.usuarioId || filtro.agenciaId) && (
                <button className="text-xs font-semibold cursor-pointer" style={{ color: "var(--blue-700)" }} onClick={() => atualizar({ usuario: undefined, agencia: undefined })}>
                  {filtro.usuarioId ? `Cliente #${filtro.usuarioId}` : `Parceiro #${filtro.agenciaId}`} · remover
                </button>
              )}
            </div>
          }
        />
      )}
    </PageShell>
  );
}
