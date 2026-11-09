"use client";
import { useEffect, useState, useTransition } from "react";
import { BadgeCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { FiltroPostsAdmin, PostAdmin, PostMediaAdmin } from "@/types/publicacao.types";
import { removerPost, restaurarPost } from "@/actions/publicacao.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { GlobalButton } from "@/components/global/GlobalButton";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { ErroCarregamento, ToolbarSelect } from "@/components/global/FiltrosUI";
import { AcaoComMotivo } from "@/components/admin/AcaoComMotivo";
import { CampoPesquisa, DataCurta, Etiqueta, Pessoa, Vazio, usePesquisaServidor } from "@/components/admin/AdminUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { ROUTES } from "@/constants/routes";
import { AutorTipo, ListaAnuncios, Miniatura, VisualizadorMedia, imagemDe } from "./PostUI";
import { DestacarModal } from "./DestaquesLista";

interface PostsTabelaProps {
  vista: "publicadas" | "retiradas";
  posts: ActionResult<Paginado<PostAdmin>>;
  filtro: FiltroPostsAdmin;
}

export function PostsTabela({ vista, posts, filtro }: PostsTabelaProps) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pesquisa, setPesquisa] = usePesquisaServidor(filtro.pesquisa, atualizar, queryAtual);
  const [linhas, setLinhas] = useState<PostAdmin[]>(posts.success ? posts.data.data : []);
  useEffect(() => setLinhas(posts.success ? posts.data.data : []), [posts]);
  const [removerAlvo, setRemoverAlvo] = useState<PostAdmin | null>(null);
  const [restaurarAlvo, setRestaurarAlvo] = useState<PostAdmin | null>(null);
  const [destacarAlvo, setDestacarAlvo] = useState<PostAdmin | null>(null);
  const [vendo, setVendo] = useState<{ media: PostMediaAdmin[]; indice: number } | null>(null);
  const [aGravar, startGravar] = useTransition();

  if (!posts.success) return <ErroCarregamento mensagem={posts.error} onRetry={recarregar} />;
  const pagina = posts.data;
  const comFiltros = !!(filtro.pesquisa || filtro.autor);
  const nomeAutor = (p: PostAdmin) => (p.autorTipo === "parceiro" ? p.agenciaNome : null) || p.autor?.nome?.trim() || "o autor";

  async function confirmarRemover(motivo: string) {
    if (!removerAlvo) return null;
    const res = await removerPost(removerAlvo.id, motivo);
    if (!res.success) return res.error;
    setLinhas((prev) => prev.filter((x) => x.id !== removerAlvo.id));
    setRemoverAlvo(null);
    toast.success("Publicação retirada", { description: "Saiu da app e dos destaques. O autor foi avisado." });
    recarregar();
    return null;
  }

  function confirmarRestaurar() {
    if (!restaurarAlvo) return;
    const alvo = restaurarAlvo;
    startGravar(async () => {
      const res = await restaurarPost(alvo.id);
      if (!res.success) {
        toast.error("Não foi possível restaurar", { description: res.error });
        return;
      }
      setLinhas((prev) => prev.filter((x) => x.id !== alvo.id));
      setRestaurarAlvo(null);
      toast.success("Publicação de volta à app", { description: "O autor foi avisado." });
      recarregar();
    });
  }

  const columns: ColumnDef<PostAdmin, unknown>[] = [
    {
      id: "capa",
      header: () => <span className="sr-only">Capa</span>,
      cell: ({ row }) => {
        const m = row.original.media.find((x) => x.estado === "pronto") ?? row.original.media[0];
        return (
          <Miniatura
            url={m ? imagemDe(m) : null}
            video={m?.tipo === "video"}
            segundos={m?.duracaoS}
            rotulo={`Ver as ${row.original.media.length} fotos e vídeos`}
            onClick={row.original.media.length ? () => setVendo({ media: row.original.media, indice: 0 }) : undefined}
          />
        );
      },
    },
    {
      id: "legenda",
      header: "Publicação",
      cell: ({ row }) => (
        <div className="max-w-[300px] flex flex-col gap-1">
          <p className="line-clamp-2" style={{ color: row.original.legenda ? "var(--text)" : "var(--text-3)" }} title={row.original.legenda ?? undefined}>
            {row.original.legenda?.trim() || "Sem legenda"}
          </p>
          <span className="flex flex-wrap gap-1">
            {row.original.verificado && (
              <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--success-fg)" }}>
                <BadgeCheck size={13} /> Verificada
              </span>
            )}
            {row.original.emDestaque && <Etiqueta tom="info">Nos destaques</Etiqueta>}
            {row.original.contestacoesAbertas > 0 && <Etiqueta tom="aviso">Contestada</Etiqueta>}
          </span>
        </div>
      ),
    },
    {
      id: "autor",
      header: "Autor",
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          {/* O nome comercial só quando difere do nome da conta (muitas vezes é o mesmo). */}
          {row.original.autorTipo === "parceiro" && row.original.agenciaNome
            && row.original.agenciaNome.trim() !== row.original.autor?.nome?.trim() && (
            <span className="text-sm font-medium truncate max-w-[180px]" style={{ color: "var(--text)" }}>{row.original.agenciaNome}</span>
          )}
          <Pessoa pessoa={row.original.autor} href={row.original.autor ? ROUTES.USUARIOS.DETALHE(row.original.autor.id) : undefined} />
          <AutorTipo tipo={row.original.autorTipo} />
        </div>
      ),
    },
    { id: "anuncios", header: "Ligada a", cell: ({ row }) => <div className="max-w-[240px]"><ListaAnuncios anuncios={row.original.anuncios} /></div> },
    vista === "publicadas"
      ? { id: "data", header: "Publicada", cell: ({ row }) => <DataCurta valor={row.original.publicadoEm} /> }
      : {
          id: "motivo",
          header: "Motivo",
          cell: ({ row }) => (
            <div className="max-w-[260px] text-xs">
              <p className="line-clamp-3" style={{ color: "var(--text)" }} title={row.original.motivoModeracao ?? undefined}>
                {row.original.motivoModeracao ?? (row.original.estado === "removido" ? "Retirada pelo próprio autor" : "—")}
              </p>
              {row.original.moderadoPor && (
                <p style={{ color: "var(--text-3)" }}>{row.original.moderadoPor} · <DataCurta valor={row.original.moderadoEm} /></p>
              )}
            </div>
          ),
        },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) =>
        vista === "publicadas" ? (
          <span className="flex gap-1 justify-end">
            {!row.original.emDestaque && (
              <GlobalButton size="sm" variant="ghost" onClick={() => setDestacarAlvo(row.original)}>
                <Sparkles size={13} /> Destacar
              </GlobalButton>
            )}
            <GlobalButton size="sm" variant="ghost" onClick={() => setRemoverAlvo(row.original)}>Retirar</GlobalButton>
          </span>
        ) : row.original.estado === "removido" && row.original.moderadoPor ? (
          <GlobalButton size="sm" variant="ghost" onClick={() => setRestaurarAlvo(row.original)}>Restaurar</GlobalButton>
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
            mensagem={comFiltros
              ? "Nenhuma publicação corresponde a estes filtros."
              : vista === "publicadas"
                ? "Ainda não há publicações na app. Os parceiros publicam no Tchilla Parceiro; as dos clientes aparecem aqui depois de aprovadas."
                : filtro.estado === "recusado" ? "Nenhuma publicação recusada." : "Nenhuma publicação retirada."}
            onLimpar={comFiltros ? () => { setPesquisa(""); atualizar({ q: undefined, autor: undefined }); } : undefined}
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
          <div className="flex flex-wrap items-center gap-2 w-full">
            <CampoPesquisa valor={pesquisa} onChange={setPesquisa} placeholder="Legenda, nome ou email do autor" rotulo="Pesquisar publicações" />
            {vista === "retiradas" && (
              <ToolbarSelect aria-label="Estado" value={filtro.estado} onChange={(e) => atualizar({ estado: e.target.value === "removido" ? undefined : e.target.value })}>
                <option value="removido">Retiradas</option>
                <option value="recusado">Recusadas na revisão</option>
              </ToolbarSelect>
            )}
            <ToolbarSelect aria-label="Autor" value={filtro.autor ?? ""} onChange={(e) => atualizar({ autor: e.target.value || undefined })}>
              <option value="">Clientes e parceiros</option>
              <option value="cliente">Só clientes</option>
              <option value="parceiro">Só parceiros</option>
            </ToolbarSelect>
          </div>
        }
      />

      <VisualizadorMedia
        media={vendo?.media ?? []}
        indice={vendo?.indice ?? null}
        onFechar={() => setVendo(null)}
        onMudar={(i) => setVendo((v) => (v ? { ...v, indice: i } : v))}
      />

      <AcaoComMotivo
        aberto={!!removerAlvo}
        onFechar={() => setRemoverAlvo(null)}
        titulo="Retirar esta publicação da app?"
        descricao={removerAlvo ? `Sai das páginas dos anúncios e dos destaques. ${nomeAutor(removerAlvo)} é avisado com o motivo. Podes restaurá-la depois.` : ""}
        rotulo="Retirar publicação"
        perigo
        ajuda="Só em casos claros: dados pessoais, conteúdo ofensivo ou informação falsa. O autor recebe este motivo."
        placeholder="Ex.: mostra o rosto e o nome de um convidado sem autorização."
        onConfirmar={confirmarRemover}
      />

      <ConfirmModal
        open={!!restaurarAlvo}
        onOpenChange={(o) => !o && setRestaurarAlvo(null)}
        title="Voltar a mostrar esta publicação?"
        description={restaurarAlvo ? `Volta às páginas dos anúncios a que está ligada. ${nomeAutor(restaurarAlvo)} é avisado.` : ""}
        onConfirm={confirmarRestaurar}
        loading={aGravar}
        confirmLabel="Restaurar publicação"
        confirmVariant="primary"
      />

      <DestacarModal
        post={destacarAlvo}
        onFechar={() => setDestacarAlvo(null)}
        onCriado={() => {
          setLinhas((prev) => prev.map((x) => (x.id === destacarAlvo?.id ? { ...x, emDestaque: true } : x)));
          setDestacarAlvo(null);
          recarregar();
        }}
      />
    </>
  );
}
