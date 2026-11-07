"use client";
import { useEffect, useState, useTransition } from "react";
import { EyeOff, Star, ThumbsDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { AvaliacaoAdmin, FiltroAvaliacoesAdmin, ResumoAvaliacoesAdmin } from "@/types/admin.types";
import { ocultarAvaliacao, restaurarAvaliacao } from "@/actions/admin.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { GlobalButton } from "@/components/global/GlobalButton";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { AcaoComMotivo } from "@/components/admin/AcaoComMotivo";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { ErroCarregamento, ToolbarSelect } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import {
  CampoPesquisa, CamposPeriodo, Cartao, DataCurta, Etiqueta, LinkInterno, NOMES_ALVO, Nota, Pessoa, Vazio,
  nomeParceiroResumo, usePesquisaServidor,
} from "@/components/admin/AdminUI";
import { ROUTES } from "@/constants/routes";
import type { FaixaNota, Visibilidade } from "./filtros";

interface AvaliacoesPageProps {
  faixa: FaixaNota;
  visibilidade: Visibilidade;
  filtro: FiltroAvaliacoesAdmin;
  lista: ActionResult<Paginado<AvaliacaoAdmin>>;
  resumo: ActionResult<ResumoAvaliacoesAdmin>;
}

export function AvaliacoesPage({ faixa, visibilidade, filtro, lista, resumo }: AvaliacoesPageProps) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pesquisa, setPesquisa] = usePesquisaServidor(filtro.pesquisa, atualizar, queryAtual);
  const [linhas, setLinhas] = useState<AvaliacaoAdmin[]>(lista.success ? lista.data.data : []);
  useEffect(() => setLinhas(lista.success ? lista.data.data : []), [lista]);
  const [ocultarAlvo, setOcultarAlvo] = useState<AvaliacaoAdmin | null>(null);
  const [mostrarAlvo, setMostrarAlvo] = useState<AvaliacaoAdmin | null>(null);
  const [aGravar, startGravar] = useTransition();

  function substituir(a: AvaliacaoAdmin) {
    setLinhas((prev) => prev.map((x) => (x.id === a.id ? a : x)));
  }

  async function confirmarOcultar(motivo: string) {
    if (!ocultarAlvo) return null;
    const res = await ocultarAvaliacao(ocultarAlvo.id, motivo);
    if (!res.success) return res.error;
    substituir(res.data);
    setOcultarAlvo(null);
    toast.success("Avaliação oculta", { description: res.mensagem });
    recarregar();
    return null;
  }

  function confirmarMostrar() {
    if (!mostrarAlvo) return;
    const alvo = mostrarAlvo;
    startGravar(async () => {
      const res = await restaurarAvaliacao(alvo.id);
      if (!res.success) {
        toast.error("Não foi possível voltar a mostrar", { description: res.error });
        return;
      }
      substituir(res.data);
      setMostrarAlvo(null);
      toast.success("Avaliação visível outra vez", { description: res.mensagem });
      recarregar();
    });
  }

  const descreverAlvo = (a: AvaliacaoAdmin) =>
    `a avaliação de ${a.cliente?.nome?.trim() || "um cliente"} (${a.nota} estrela${a.nota === 1 ? "" : "s"}) a ${a.alvoNome?.trim() || (a.alvo ? NOMES_ALVO[a.alvo].toLowerCase() : "um anúncio")}`;

  const pagina = lista.success ? lista.data : null;
  const r = resumo.success ? resumo.data : null;
  const comFiltros = !!(faixa !== "todas" || visibilidade !== "todas" || filtro.alvo || filtro.pesquisa || filtro.de || filtro.ate || filtro.usuarioId || filtro.agenciaId);

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
          <span className="flex flex-wrap gap-1">
            {row.original.apagadaEm && <Etiqueta>Apagada pelo cliente</Etiqueta>}
            {row.original.ocultaEm && (
              <span title={[row.original.ocultaMotivo, row.original.ocultaPor?.nome && `por ${row.original.ocultaPor.nome}`].filter(Boolean).join(" · ") || undefined}>
                <Etiqueta tom="aviso">Oculta pela equipa</Etiqueta>
              </span>
            )}
          </span>
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
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) =>
        row.original.apagadaEm ? null : row.original.ocultaEm ? (
          <GlobalButton size="sm" variant="ghost" onClick={() => setMostrarAlvo(row.original)}>Mostrar</GlobalButton>
        ) : (
          <GlobalButton size="sm" variant="ghost" onClick={() => setOcultarAlvo(row.original)}>Ocultar</GlobalButton>
        ),
    },
  ];

  return (
    <PageShell title="Avaliações" subtitle="O que os clientes dizem dos anúncios. Uma avaliação oculta sai da app e das médias; o cliente não é avisado.">
      {r ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label={`Média · ${r.total} avaliações`} value={r.total ? r.media.toLocaleString("pt-AO", { maximumFractionDigits: 2 }) : "—"} suffix={r.total ? "/ 5" : undefined} icon={<Star size={16} />} />
          <KPICard label="Negativas (1 e 2)" value={r.negativas} icon={<ThumbsDown size={16} />} />
          <KPICard label="Ocultas pela equipa" value={r.ocultas} icon={<EyeOff size={16} />} />
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
              onLimpar={comFiltros ? () => { setPesquisa(""); atualizar({ nota: undefined, vis: undefined, alvo: undefined, q: undefined, de: undefined, ate: undefined, usuario: undefined, agencia: undefined }); } : undefined}
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
              <ToolbarSelect aria-label="Visibilidade" value={visibilidade} onChange={(e) => atualizar({ vis: e.target.value === "todas" ? undefined : e.target.value })}>
                <option value="todas">Visíveis e ocultas</option>
                <option value="visiveis">Só as visíveis na app</option>
                <option value="ocultas">Só as ocultas</option>
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

      <AcaoComMotivo
        aberto={!!ocultarAlvo}
        onFechar={() => setOcultarAlvo(null)}
        titulo="Ocultar esta avaliação?"
        descricao={ocultarAlvo ? `Sai da app e deixa de contar para a média, mas fica aqui. Vais ocultar ${descreverAlvo(ocultarAlvo)}. Podes voltar a mostrá-la.` : ""}
        rotulo="Ocultar avaliação"
        ajuda="Fica registado no painel; o cliente não é avisado."
        placeholder="Ex.: linguagem ofensiva ou dados pessoais no comentário."
        onConfirmar={confirmarOcultar}
      />

      <ConfirmModal
        open={!!mostrarAlvo}
        onOpenChange={(o) => !o && setMostrarAlvo(null)}
        title="Voltar a mostrar esta avaliação?"
        description={mostrarAlvo ? `Volta à app e à média do anúncio: ${descreverAlvo(mostrarAlvo)}.` : ""}
        onConfirm={confirmarMostrar}
        loading={aGravar}
        confirmLabel="Mostrar avaliação"
        confirmVariant="primary"
      />
    </PageShell>
  );
}
