"use client";
import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import { FAIXAS_CUSTO, type FiltroPostsAdmin, type PostAdmin } from "@/types/publicacao.types";
import { aprovarPost, recusarPost } from "@/actions/publicacao.actions";
import { GlobalButton } from "@/components/global/GlobalButton";
import { ErroCarregamento, ToolbarSelect } from "@/components/global/FiltrosUI";
import { AcaoComMotivo } from "@/components/admin/AcaoComMotivo";
import { CampoPesquisa, DataCurta, Etiqueta, LinkInterno, Pessoa, Vazio, usePesquisaServidor } from "@/components/admin/AdminUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { ROUTES } from "@/constants/routes";
import { AutorTipo, FilaMedia, ListaAnuncios } from "./PostUI";

/*
 * Fila de moderação: cartões em vez de tabela, porque aqui decide-se olhando para as fotos.
 * O mais antigo vem primeiro (é o que está mais perto do prazo).
 */
export function RevisaoLista({ posts, filtro }: { posts: ActionResult<Paginado<PostAdmin>>; filtro: FiltroPostsAdmin }) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pesquisa, setPesquisa] = usePesquisaServidor(filtro.pesquisa, atualizar, queryAtual);
  const [linhas, setLinhas] = useState<PostAdmin[]>(posts.success ? posts.data.data : []);
  useEffect(() => setLinhas(posts.success ? posts.data.data : []), [posts]);
  const [aAprovar, setAAprovar] = useState<number | null>(null);
  const [recusarAlvo, setRecusarAlvo] = useState<PostAdmin | null>(null);

  if (!posts.success) return <ErroCarregamento mensagem={posts.error} onRetry={recarregar} />;
  const pagina = posts.data;

  async function aprovar(p: PostAdmin) {
    setAAprovar(p.id);
    const res = await aprovarPost(p.id);
    setAAprovar(null);
    if (!res.success) {
      toast.error("Não foi possível aprovar", { description: res.error });
      return;
    }
    setLinhas((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("Publicação aprovada", { description: "Já aparece na app. O autor foi avisado." });
    recarregar();
  }

  async function confirmarRecusa(motivo: string) {
    if (!recusarAlvo) return null;
    const res = await recusarPost(recusarAlvo.id, motivo);
    if (!res.success) return res.error;
    setLinhas((prev) => prev.filter((x) => x.id !== recusarAlvo.id));
    setRecusarAlvo(null);
    toast.success("Publicação recusada", { description: "O autor foi avisado e pode corrigir e enviar outra vez." });
    recarregar();
    return null;
  }

  return (
    <div className="flex flex-col gap-3" aria-busy={isPending}>
      <div className="flex flex-wrap items-center gap-2">
        <CampoPesquisa valor={pesquisa} onChange={setPesquisa} placeholder="Legenda, nome ou email do autor" rotulo="Pesquisar publicações" />
        <ToolbarSelect aria-label="Autor" value={filtro.autor ?? ""} onChange={(e) => atualizar({ autor: e.target.value || undefined })}>
          <option value="">Clientes e parceiros</option>
          <option value="cliente">Só clientes</option>
          <option value="parceiro">Só parceiros</option>
        </ToolbarSelect>
      </div>

      {linhas.length === 0 ? (
        <div className="rounded-lg p-6" style={{ border: "1px solid var(--border)", background: "var(--surface, #fff)" }}>
          <Vazio
            mensagem={filtro.pesquisa || filtro.autor
              ? "Nenhuma publicação para rever com estes filtros."
              : "Não há publicações para rever. Quando um cliente enviar uma, aparece aqui e a equipa recebe um aviso."}
            onLimpar={filtro.pesquisa || filtro.autor ? () => { setPesquisa(""); atualizar({ q: undefined, autor: undefined }); } : undefined}
          />
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {linhas.map((p) => (
            <li
              key={p.id}
              className="grid gap-4 p-4 rounded-lg lg:grid-cols-[minmax(0,1fr)_220px]"
              style={{ border: `1px solid ${p.prazoEsgotado ? "var(--warning-bd)" : "var(--border)"}`, background: "var(--surface, #fff)" }}
            >
              <div className="flex flex-col gap-3 min-w-0">
                <FilaMedia media={p.media} />
                <div className="flex flex-wrap items-center gap-2">
                  <Pessoa pessoa={p.autor} href={p.autor ? ROUTES.USUARIOS.DETALHE(p.autor.id) : undefined} />
                  <AutorTipo tipo={p.autorTipo} />
                  {p.verificado ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--success-fg)" }}>
                      <BadgeCheck size={14} /> Reserva verificada
                    </span>
                  ) : p.reservaId ? (
                    <Etiqueta>Reserva ainda por concluir ou pagar</Etiqueta>
                  ) : null}
                  {p.reservaId && <LinkInterno href={ROUTES.RESERVAS.DETALHE(p.reservaId)}>Reserva #{p.reservaId}</LinkInterno>}
                </div>
                {p.legenda ? (
                  <p className="text-sm whitespace-pre-line" style={{ color: "var(--text)" }}>{p.legenda}</p>
                ) : (
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>Sem legenda</p>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>Ligada a</span>
                  <ListaAnuncios anuncios={p.anuncios} />
                </div>
                {p.faixaCusto && (
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>Custo total mostrado: {FAIXAS_CUSTO[p.faixaCusto] ?? p.faixaCusto}</p>
                )}
              </div>

              <div className="flex flex-col gap-3 lg:items-stretch">
                <div className="text-xs flex flex-col gap-1" style={{ color: "var(--text-2)" }}>
                  <span>Enviada <DataCurta valor={p.enviadoRevisaoEm} comHora /></span>
                  {p.enviadoRevisaoEm && (
                    <span>
                      {p.prazoEsgotado
                        ? <Etiqueta tom="aviso">Fora do prazo · há {formatDistanceToNowStrict(new Date(p.enviadoRevisaoEm), { locale: ptBR })}</Etiqueta>
                        : <Etiqueta tom="info">Há {formatDistanceToNowStrict(new Date(p.enviadoRevisaoEm), { locale: ptBR })}</Etiqueta>}
                    </span>
                  )}
                </div>
                <GlobalButton onClick={() => aprovar(p)} loading={aAprovar === p.id} disabled={aAprovar !== null}>
                  Aprovar publicação
                </GlobalButton>
                <GlobalButton variant="secondary" onClick={() => setRecusarAlvo(p)} disabled={aAprovar !== null}>
                  Recusar
                </GlobalButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagina.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm" style={{ color: "var(--text-2)" }}>
          <span>Página {pagina.pageNumber} de {pagina.totalPages} · {pagina.totalItems} para rever</span>
          <span className="flex gap-2">
            <GlobalButton size="sm" variant="ghost" disabled={pagina.pageNumber <= 1} onClick={() => atualizar({ pagina: pagina.pageNumber - 1 > 1 ? pagina.pageNumber - 1 : undefined })}>Anterior</GlobalButton>
            <GlobalButton size="sm" variant="ghost" disabled={pagina.pageNumber >= pagina.totalPages} onClick={() => atualizar({ pagina: pagina.pageNumber + 1 })}>Seguinte</GlobalButton>
          </span>
        </div>
      )}

      <AcaoComMotivo
        aberto={!!recusarAlvo}
        onFechar={() => setRecusarAlvo(null)}
        titulo="Recusar esta publicação?"
        descricao={recusarAlvo ? `Não aparece na app. ${recusarAlvo.autor?.nome?.trim() || "O autor"} é avisado com o motivo e pode corrigir e enviar outra vez.` : ""}
        rotulo="Recusar publicação"
        perigo
        ajuda="O autor recebe este motivo na notificação."
        placeholder="Ex.: a foto mostra a morada da casa dos noivos."
        onConfirmar={confirmarRecusa}
      />
    </div>
  );
}
