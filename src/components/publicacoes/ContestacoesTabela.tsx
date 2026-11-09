"use client";
import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import { MOTIVOS_CONTESTACAO, type ContestacaoAdmin } from "@/types/publicacao.types";
import { decidirContestacao } from "@/actions/publicacao.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { GlobalButton } from "@/components/global/GlobalButton";
import { ErroCarregamento, ToolbarSelect } from "@/components/global/FiltrosUI";
import { AcaoComMotivo } from "@/components/admin/AcaoComMotivo";
import { DataCurta, Etiqueta, Vazio } from "@/components/admin/AdminUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { ListaAnuncios, Miniatura } from "./PostUI";

const ESTADOS: Record<ContestacaoAdmin["estado"], { rotulo: string; tom: "aviso" | "perigo" | "neutro" }> = {
  aberta: { rotulo: "Por decidir", tom: "aviso" },
  aceite: { rotulo: "Publicação retirada", tom: "perigo" },
  recusada: { rotulo: "Publicação mantida", tom: "neutro" },
};

/*
 * Um parceiro marcado num post de cliente pode contestar, mas não esconder.
 * A equipa decide: retirar (só em casos claros) ou manter. O parceiro é avisado nos dois casos.
 */
export function ContestacoesTabela({ contestacoes, estado }: { contestacoes: ActionResult<Paginado<ContestacaoAdmin>>; estado: string }) {
  const { atualizar, recarregar, isPending } = useFiltrosUrl();
  const [linhas, setLinhas] = useState<ContestacaoAdmin[]>(contestacoes.success ? contestacoes.data.data : []);
  useEffect(() => setLinhas(contestacoes.success ? contestacoes.data.data : []), [contestacoes]);
  const [decidir, setDecidir] = useState<{ alvo: ContestacaoAdmin; aceitar: boolean } | null>(null);

  if (!contestacoes.success) return <ErroCarregamento mensagem={contestacoes.error} onRetry={recarregar} />;
  const pagina = contestacoes.data;

  async function confirmar(decisao: string) {
    if (!decidir) return null;
    const res = await decidirContestacao(decidir.alvo.id, decidir.aceitar, decisao);
    if (!res.success) return res.error;
    setLinhas((prev) => prev.map((x) => (x.id === decidir.alvo.id ? { ...x, estado: decidir.aceitar ? "aceite" : "recusada", decisao } : x)));
    toast.success(decidir.aceitar ? "Publicação retirada" : "Publicação mantida", { description: "O parceiro foi avisado da decisão." });
    setDecidir(null);
    recarregar();
    return null;
  }

  const columns: ColumnDef<ContestacaoAdmin, unknown>[] = [
    {
      id: "post",
      header: "Publicação contestada",
      cell: ({ row }) => {
        const p = row.original.post;
        return (
          <div className="flex gap-3 max-w-[340px]">
            <Miniatura url={p.capa} rotulo="Capa" />
            <div className="min-w-0 flex flex-col gap-1">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                {p.autorNome ?? "—"}
                {p.verificado && <BadgeCheck size={13} className="inline ml-1" style={{ color: "var(--success-fg)" }} aria-label="Reserva verificada" />}
              </p>
              <p className="text-xs line-clamp-2" style={{ color: "var(--text-2)" }}>{p.legenda?.trim() || "Sem legenda"}</p>
              <ListaAnuncios anuncios={p.anuncios} />
            </div>
          </div>
        );
      },
    },
    {
      id: "parceiro",
      header: "Parceiro",
      cell: ({ row }) => <span className="text-sm" style={{ color: "var(--text)" }}>{row.original.agenciaNome?.trim() || `Parceiro #${row.original.agenciaId}`}</span>,
    },
    {
      id: "motivo",
      header: "Motivo",
      cell: ({ row }) => (
        <div className="max-w-[260px] text-xs flex flex-col gap-1">
          <span className="font-medium" style={{ color: "var(--text)" }}>{MOTIVOS_CONTESTACAO[row.original.motivo]}</span>
          {row.original.descricao && <span style={{ color: "var(--text-2)" }}>{row.original.descricao}</span>}
          {row.original.decisao && (
            <span style={{ color: "var(--text-3)" }}>Decisão: {row.original.decisao}{row.original.decididoPor ? ` · ${row.original.decididoPor}` : ""}</span>
          )}
        </div>
      ),
    },
    { accessorKey: "criadoEm", header: "Data", cell: ({ row }) => <DataCurta valor={row.original.criadoEm} comHora /> },
    { id: "estado", header: "Estado", cell: ({ row }) => <Etiqueta tom={ESTADOS[row.original.estado].tom}>{ESTADOS[row.original.estado].rotulo}</Etiqueta> },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) =>
        row.original.estado === "aberta" ? (
          <span className="flex gap-1 justify-end">
            <GlobalButton size="sm" variant="secondary" onClick={() => setDecidir({ alvo: row.original, aceitar: false })}>Manter</GlobalButton>
            <GlobalButton size="sm" variant="ghost" onClick={() => setDecidir({ alvo: row.original, aceitar: true })}>Retirar</GlobalButton>
          </span>
        ) : null,
    },
  ];

  return (
    <>
      <GlobalTable
        data={linhas}
        columns={columns}
        isLoading={isPending}
        emptyMessage={
          <Vazio
            mensagem={estado === "aberta"
              ? "Não há contestações por decidir. Quando um parceiro contestar uma publicação de cliente, aparece aqui e a equipa recebe um aviso."
              : "Nenhuma contestação com este estado."}
          />
        }
        serverPagination={{
          page: pagina.pageNumber,
          pageSize: pagina.pageSize,
          totalItems: pagina.totalItems,
          totalPages: pagina.totalPages,
          onPageChange: (p) => atualizar({ pagina: p > 1 ? p : undefined }),
        }}
        toolbar={
          <ToolbarSelect aria-label="Estado" value={estado} onChange={(e) => atualizar({ cestado: e.target.value === "aberta" ? undefined : e.target.value })}>
            <option value="aberta">Por decidir</option>
            <option value="aceite">Publicação retirada</option>
            <option value="recusada">Publicação mantida</option>
            <option value="todas">Todas</option>
          </ToolbarSelect>
        }
      />

      <AcaoComMotivo
        aberto={!!decidir}
        onFechar={() => setDecidir(null)}
        titulo={decidir?.aceitar ? "Retirar a publicação contestada?" : "Manter a publicação?"}
        descricao={decidir
          ? decidir.aceitar
            ? `A publicação de ${decidir.alvo.post.autorNome ?? "o cliente"} sai da app. O cliente e ${decidir.alvo.agenciaNome ?? "o parceiro"} são avisados com esta decisão.`
            : `A publicação continua visível. ${decidir.alvo.agenciaNome ?? "O parceiro"} é avisado com esta decisão.`
          : ""}
        rotulo={decidir?.aceitar ? "Retirar publicação" : "Manter publicação"}
        perigo={decidir?.aceitar}
        ajuda="Só se retira em casos claros: dados pessoais, conteúdo ofensivo ou informação falsa."
        placeholder={decidir?.aceitar ? "Ex.: o parceiro mostrou que não participou neste evento." : "Ex.: a publicação descreve o serviço como foi prestado."}
        onConfirmar={confirmar}
      />
    </>
  );
}
