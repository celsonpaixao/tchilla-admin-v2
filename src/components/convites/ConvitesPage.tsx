"use client";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { ConviteAdmin, FiltroConvitesAdmin } from "@/types/admin.types";
import { GlobalTable } from "@/components/global/GlobalTable";
import { PageShell } from "@/components/global/PageShell";
import { StatusBadge } from "@/components/global/StatusBadge";
import { ErroCarregamento, ToolbarSelect } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { CampoPesquisa, CamposPeriodo, DataCurta, Etiqueta, Mono, Numero, Pessoa, Vazio, usePesquisaServidor } from "@/components/admin/AdminUI";
import { ROUTES } from "@/constants/routes";

const ESCALOES: Record<string, string> = { gratis: "Grátis", ate25: "Até 25", ate50: "Até 50", ate100: "Até 100", ate200: "Até 200", ilimitado: "Ilimitado" };

export function ConvitesPage({ filtro, lista }: { filtro: FiltroConvitesAdmin; lista: ActionResult<Paginado<ConviteAdmin>> }) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pesquisa, setPesquisa] = usePesquisaServidor(filtro.pesquisa, atualizar, queryAtual);
  const [linhas, setLinhas] = useState<ConviteAdmin[]>(lista.success ? lista.data.data : []);
  useEffect(() => setLinhas(lista.success ? lista.data.data : []), [lista]);

  const pagina = lista.success ? lista.data : null;
  const comFiltros = !!(filtro.pesquisa || filtro.escalao || filtro.quando || filtro.de || filtro.ate);

  const columns: ColumnDef<ConviteAdmin, unknown>[] = [
    { accessorKey: "id", header: "Nº", cell: ({ row }) => <Mono>#{row.original.id}</Mono> },
    {
      id: "evento",
      header: "Evento",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[220px]">
          <p className="font-medium truncate" style={{ color: "var(--text)" }}>{row.original.nomeEvento?.trim() || "Sem nome"}</p>
          <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{row.original.local?.trim() || "Sem local"}{row.original.tema ? ` · ${row.original.tema}` : ""}</p>
        </div>
      ),
    },
    { id: "dono", header: "Criado por", cell: ({ row }) => <Pessoa pessoa={row.original.dono} href={row.original.dono ? ROUTES.USUARIOS.DETALHE(row.original.dono.id) : undefined} /> },
    { accessorKey: "dataEvento", header: "Data do evento", cell: ({ row }) => <DataCurta valor={row.original.dataEvento} comHora /> },
    {
      accessorKey: "escalao",
      header: "Escalão",
      cell: ({ row }) => {
        const e = row.original.escalao ?? "";
        return (
          <span className="flex items-center gap-1 flex-wrap">
            <Etiqueta tom={e === "gratis" ? "neutro" : "info"}>{ESCALOES[e] ?? (e || "—")}</Etiqueta>
            {row.original.pagamento && <StatusBadge status={row.original.pagamento} />}
          </span>
        );
      },
    },
    { accessorKey: "convidados", header: () => <span className="block w-full text-right">Convidados</span>, cell: ({ getValue }) => <Numero valor={getValue() as number} /> },
    {
      id: "confirmados",
      header: () => <span className="block w-full text-right">Confirmados</span>,
      cell: ({ row }) => (
        <span className="block text-right" style={{ fontVariantNumeric: "tabular-nums" }} title={`${row.original.responderam} responderam · ${row.original.pessoasConfirmadas} pessoas`}>
          {row.original.confirmados}
          <span className="text-xs ml-1" style={{ color: "var(--text-3)" }}>({row.original.pessoasConfirmadas} pessoas)</span>
        </span>
      ),
    },
    { accessorKey: "visualizacoes", header: () => <span className="block w-full text-right">Vistas</span>, cell: ({ getValue }) => <Numero valor={getValue() as number} /> },
    { accessorKey: "criadoEm", header: "Criado", cell: ({ row }) => <DataCurta valor={row.original.criadoEm} /> },
  ];

  return (
    <PageShell title="Convites digitais" subtitle={pagina ? `${pagina.totalItems} ${pagina.totalItems === 1 ? "convite" : "convites"} · só leitura` : undefined}>
      {!lista.success ? (
        <ErroCarregamento mensagem={lista.error} onRetry={recarregar} />
      ) : (
        <GlobalTable
          data={linhas}
          columns={columns}
          isLoading={isPending}
          emptyMessage={
            <Vazio
              mensagem={comFiltros ? "Nenhum convite corresponde a estes filtros." : "Ainda não foram criados convites digitais."}
              onLimpar={comFiltros ? () => { setPesquisa(""); atualizar({ q: undefined, escalao: undefined, quando: undefined, de: undefined, ate: undefined }); } : undefined}
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
              <CampoPesquisa valor={pesquisa} onChange={setPesquisa} placeholder="Evento, nome ou email de quem criou" rotulo="Pesquisar convites" />
              <ToolbarSelect aria-label="Escalão" value={filtro.escalao ?? ""} onChange={(e) => atualizar({ escalao: e.target.value || undefined })}>
                <option value="">Todos os escalões</option>
                {Object.entries(ESCALOES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </ToolbarSelect>
              <ToolbarSelect aria-label="Quando" value={filtro.quando ?? ""} onChange={(e) => atualizar({ quando: e.target.value || undefined })}>
                <option value="">Todas as datas</option>
                <option value="futuros">Ainda por acontecer</option>
                <option value="passados">Já passaram</option>
              </ToolbarSelect>
              <CamposPeriodo rotulo="Evento" de={filtro.de} ate={filtro.ate} onChange={(m) => atualizar(m)} />
            </div>
          }
        />
      )}
    </PageShell>
  );
}
