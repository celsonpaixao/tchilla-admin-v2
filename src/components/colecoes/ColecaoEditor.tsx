"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Copy, ExternalLink, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { ColecaoAdmin, ColecaoEntrada, ColecaoItem, EstadoColecao } from "@/types/colecao.types";
import type { UsuarioAdmin } from "@/types/admin.types";
import {
  apagarColecao, atualizarColecao, criarColecao, pesquisarAnunciosColecao, pesquisarClientesColecao,
} from "@/actions/colecao.actions";
import { PageShell } from "@/components/global/PageShell";
import { GlobalButton } from "@/components/global/GlobalButton";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { ToolbarInput } from "@/components/global/FiltrosUI";
import { Cartao, Etiqueta, Migalhas } from "@/components/admin/AdminUI";
import { Miniatura } from "@/components/publicacoes/PostUI";
import { ROUTES } from "@/constants/routes";
import { EstadoColecaoEtiqueta, NOMES_TIPO, linkColecao } from "./ColecaoUI";

/* Igual ao SlugDe do back-end: "Casamento E&C" → "casamento-e-c". */
const slugDe = (texto: string) =>
  texto.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const AREA: React.CSSProperties = {
  background: "var(--gray-50)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  fontSize: "var(--font-sm)",
  color: "var(--text)",
  padding: "8px 10px",
  outline: "none",
  minHeight: 96,
};

/** Rótulo sempre por cima do campo. */
function CampoForm({ rotulo, ajuda, children }: { rotulo: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: "var(--text-2)" }}>
      <span>{rotulo}</span>
      {children}
      {ajuda && <span className="font-normal" style={{ color: "var(--text-3)" }}>{ajuda}</span>}
    </label>
  );
}

/** Pesquisa com 350 ms de pausa; devolve [] com menos de 2 letras. */
function usePesquisa<T>(termo: string, pedir: (t: string) => Promise<{ success: true; data: T[] } | { success: false; error: string }>) {
  const [resultados, setResultados] = useState<T[]>([]);
  const [aProcurar, setAProcurar] = useState(false);
  useEffect(() => {
    const t = termo.trim();
    if (t.length < 2) {
      setResultados([]);
      return;
    }
    let cancelado = false;
    setAProcurar(true);
    const id = setTimeout(async () => {
      const res = await pedir(t);
      if (cancelado) return;
      setAProcurar(false);
      setResultados(res.success ? res.data : []);
      if (!res.success) toast.error("A pesquisa falhou", { description: res.error });
    }, 350);
    return () => {
      cancelado = true;
      clearTimeout(id);
    };
  }, [termo, pedir]);
  return { resultados, aProcurar };
}

const pedirAnuncios = (t: string) => pesquisarAnunciosColecao(t);
const pedirClientes = async (t: string) => {
  const res = await pesquisarClientesColecao(t);
  return res.success ? { success: true as const, data: res.data.data } : res;
};

/*
 * Criar ou editar uma coleção. Tudo se guarda de uma vez (os anúncios enviados substituem os
 * que lá estão). Os botões dizem o estado em que fica: rascunho, publicada ou arquivada.
 */
export function ColecaoEditor({ colecao }: { colecao: ColecaoAdmin | null }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(colecao?.titulo ?? "");
  const [slug, setSlug] = useState(colecao?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!colecao);
  const [subtitulo, setSubtitulo] = useState(colecao?.subtitulo ?? "");
  const [descricao, setDescricao] = useState(colecao?.descricao ?? "");
  const [capaUrl, setCapaUrl] = useState(colecao?.capaUrl ?? "");
  const [dataEvento, setDataEvento] = useState(colecao?.dataEvento ?? "");
  const [dono, setDono] = useState<{ id: number; nome: string } | null>(
    colecao?.usuarioId ? { id: colecao.usuarioId, nome: colecao.usuarioNome ?? `Conta ${colecao.usuarioId}` } : null,
  );
  const [itens, setItens] = useState<ColecaoItem[]>(colecao?.itens ?? []);
  const [erro, setErro] = useState<string | null>(null);
  const [apagar, setApagar] = useState(false);
  const [aGravar, startGravar] = useTransition();

  const slugFinal = slugManual ? slug : slugDe(titulo);
  const estado: EstadoColecao = colecao?.estado ?? "rascunho";

  function mover(i: number, delta: number) {
    setItens((prev) => {
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const novo = [...prev];
      [novo[i], novo[j]] = [novo[j], novo[i]];
      return novo;
    });
  }

  function alterarItem(i: number, campo: "rotulo" | "nota", valor: string) {
    setItens((prev) => prev.map((x, n) => (n === i ? { ...x, [campo]: valor } : x)));
  }

  function juntar(item: ColecaoItem) {
    if (itens.some((x) => x.tipo === item.tipo && x.anuncioId === item.anuncioId)) {
      toast.info("Esse anúncio já está na coleção");
      return;
    }
    setItens((prev) => [...prev, { ...item, rotulo: item.tipo === "espaco" ? "Espaço" : null, nota: null }]);
  }

  function guardar(novoEstado: EstadoColecao) {
    setErro(null);
    const dados: ColecaoEntrada = {
      slug: slugFinal,
      titulo,
      subtitulo: subtitulo || null,
      descricao: descricao || null,
      capaUrl: capaUrl || null,
      dataEvento: dataEvento || null,
      usuarioId: dono?.id ?? null,
      estado: novoEstado,
      itens: itens.map((x) => ({ tipo: x.tipo, id: x.anuncioId, rotulo: x.rotulo?.trim() || null, nota: x.nota?.trim() || null })),
    };
    startGravar(async () => {
      const res = colecao ? await atualizarColecao(colecao.id, dados) : await criarColecao(dados);
      if (!res.success) {
        setErro(res.error);
        return;
      }
      const mensagens: Record<EstadoColecao, string> = {
        publicada: "Já aparece na app e o link funciona.",
        rascunho: "Ainda não aparece na app.",
        arquivada: "Saiu da app. O link deixa de abrir.",
      };
      toast.success(res.mensagem, { description: mensagens[novoEstado] });
      setItens(res.data.itens);
      if (!colecao) router.replace(ROUTES.GESTAO.COLECAO(res.data.id));
      else router.refresh();
    });
  }

  function confirmarApagar() {
    if (!colecao) return;
    startGravar(async () => {
      const res = await apagarColecao(colecao.id);
      if (!res.success) {
        toast.error("Não foi possível apagar", { description: res.error });
        return;
      }
      toast.success("Coleção apagada");
      router.replace(ROUTES.GESTAO.COLECOES);
    });
  }

  const link = linkColecao(slugFinal || "…");

  return (
    <PageShell
      title={colecao ? colecao.titulo : "Nova coleção"}
      subtitle="Os fornecedores de um evento numa página da app. Cada anúncio abre a sua página e contrata-se à parte."
      actions={colecao && <EstadoColecaoEtiqueta estado={estado} />}
    >
      <Migalhas itens={[{ label: "Coleções", href: ROUTES.GESTAO.COLECOES }, { label: colecao?.titulo ?? "Nova" }]} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Cartao titulo="Página">
          <div className="flex flex-col gap-3">
            <CampoForm rotulo="Título">
              <ToolbarInput value={titulo} maxLength={80} onChange={(e) => setTitulo(e.target.value)} placeholder="Casamento E&C" />
            </CampoForm>
            <CampoForm rotulo="Endereço" ajuda={link}>
              <ToolbarInput
                value={slugFinal}
                maxLength={60}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                placeholder="casamento-e-c"
              />
            </CampoForm>
            <CampoForm rotulo="Subtítulo (opcional)">
              <ToolbarInput value={subtitulo} maxLength={140} onChange={(e) => setSubtitulo(e.target.value)} placeholder="Elsandro e Cleópatra, 15 de novembro de 2026" />
            </CampoForm>
            <CampoForm rotulo="Descrição (opcional)">
              <textarea value={descricao} maxLength={2000} onChange={(e) => setDescricao(e.target.value)} style={AREA} placeholder="Os fornecedores que fizeram o nosso dia. Podes contratar todos ou só alguns." />
            </CampoForm>
            <div className="grid gap-3 sm:grid-cols-2">
              <CampoForm rotulo="Data do evento (opcional)">
                <ToolbarInput type="date" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} />
              </CampoForm>
              <CampoForm rotulo="Capa (opcional)" ajuda="Endereço https. Sem capa, usa a primeira foto das publicações do dono ou dos anúncios.">
                <ToolbarInput value={capaUrl} maxLength={500} onChange={(e) => setCapaUrl(e.target.value)} placeholder="https://storage.tchilla.com/…" />
              </CampoForm>
            </div>
            <EscolherDono dono={dono} onEscolher={setDono} />
          </div>
        </Cartao>

        <Cartao titulo={`Anúncios (${itens.length})`}>
          <JuntarAnuncio onJuntar={juntar} />
          {itens.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-3)" }}>Procura o espaço e cada serviço do evento e junta-os pela ordem em que devem aparecer.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {itens.map((item, i) => (
                <li key={`${item.tipo}-${item.anuncioId}`} className="grid gap-2 p-2 rounded-lg grid-cols-[auto_minmax(0,1fr)_auto]" style={{ border: "1px solid var(--border)", opacity: item.disponivel ? 1 : 0.6 }}>
                  <Miniatura url={item.imagem} tamanho={48} rotulo={item.nome ?? "Anúncio"} />
                  <div className="min-w-0 flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{item.nome ?? "Anúncio apagado"}</span>
                      <Etiqueta>{NOMES_TIPO[item.tipo]}</Etiqueta>
                      {!item.disponivel && <Etiqueta tom="perigo">Já não existe</Etiqueta>}
                    </div>
                    {item.prestador && <span className="text-xs truncate" style={{ color: "var(--text-3)" }}>{item.prestador}</span>}
                    <div className="grid gap-1.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
                      <ToolbarInput value={item.rotulo ?? ""} maxLength={40} onChange={(e) => alterarItem(i, "rotulo", e.target.value)} placeholder="Papel: Fotografia" aria-label="Papel no evento" />
                      <ToolbarInput value={item.nota ?? ""} maxLength={500} onChange={(e) => alterarItem(i, "nota", e.target.value)} placeholder="Nota (opcional)" aria-label="Nota" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <GlobalButton size="sm" variant="ghost" iconOnly aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)}><ArrowUp size={14} /></GlobalButton>
                    <GlobalButton size="sm" variant="ghost" iconOnly aria-label="Descer" disabled={i === itens.length - 1} onClick={() => mover(i, 1)}><ArrowDown size={14} /></GlobalButton>
                    <GlobalButton size="sm" variant="ghost" iconOnly aria-label="Tirar da coleção" onClick={() => setItens((prev) => prev.filter((_, n) => n !== i))}><X size={14} /></GlobalButton>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Cartao>
      </div>

      {colecao && colecao.publicacoes.length > 0 && (
        <Cartao titulo={`Publicações do dono na página (${colecao.publicacoes.length})`}>
          <ul className="flex flex-wrap gap-2">
            {colecao.publicacoes.map((p) => (
              <li key={p.id}>
                <Miniatura url={p.media[0] ? (p.media[0].tipo === "video" ? p.media[0].miniaturaUrl : p.media[0].url) : null} tamanho={72} rotulo={p.legenda ?? "Publicação"} />
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      {erro && (
        <p role="alert" className="text-sm rounded-lg px-3 py-2" style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", color: "var(--danger-fg)" }}>{erro}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {estado === "publicada" ? (
          <>
            <GlobalButton variant="accent" loading={aGravar} onClick={() => guardar("publicada")}>Guardar alterações</GlobalButton>
            <GlobalButton variant="secondary" disabled={aGravar} onClick={() => guardar("arquivada")}>Arquivar</GlobalButton>
          </>
        ) : (
          <>
            <GlobalButton variant="accent" loading={aGravar} disabled={itens.length === 0} onClick={() => guardar("publicada")}>Publicar na app</GlobalButton>
            <GlobalButton variant="secondary" disabled={aGravar} onClick={() => guardar(estado === "arquivada" ? "arquivada" : "rascunho")}>
              {estado === "arquivada" ? "Guardar (fica arquivada)" : "Guardar rascunho"}
            </GlobalButton>
          </>
        )}
        {estado === "publicada" && (
          <>
            <GlobalButton variant="ghost" leftIcon={<Copy size={14} />} onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link copiado"))}>Copiar link</GlobalButton>
            <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--blue-700)" }}>
              Abrir <ExternalLink size={13} />
            </a>
          </>
        )}
        {colecao && estado !== "publicada" && (
          <GlobalButton variant="ghost" leftIcon={<Trash2 size={14} />} onClick={() => setApagar(true)}>Apagar</GlobalButton>
        )}
      </div>

      <ConfirmModal
        open={apagar}
        onOpenChange={setApagar}
        title="Apagar esta coleção?"
        description="A página e a lista de anúncios desaparecem. Os anúncios e as publicações ficam como estão."
        onConfirm={confirmarApagar}
        loading={aGravar}
        confirmLabel="Apagar coleção"
      />
    </PageShell>
  );
}

function JuntarAnuncio({ onJuntar }: { onJuntar: (item: ColecaoItem) => void }) {
  const [termo, setTermo] = useState("");
  const { resultados, aProcurar } = usePesquisa(termo, pedirAnuncios);
  return (
    <div className="flex flex-col gap-2">
      <ToolbarInput type="search" value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Procurar anúncio ou parceiro (ex.: Jardim)" aria-label="Procurar anúncio" />
      {termo.trim().length >= 2 && (
        <ul className="flex flex-col rounded-lg max-h-64 overflow-y-auto" style={{ border: "1px solid var(--border)" }}>
          {aProcurar && resultados.length === 0 && <li className="p-2 text-sm" style={{ color: "var(--text-3)" }}>A procurar…</li>}
          {!aProcurar && resultados.length === 0 && <li className="p-2 text-sm" style={{ color: "var(--text-3)" }}>Nada encontrado.</li>}
          {resultados.map((r) => (
            <li key={`${r.tipo}-${r.anuncioId}`}>
              <button
                type="button"
                onClick={() => {
                  onJuntar(r);
                  setTermo("");
                }}
                className="w-full grid gap-2 p-2 grid-cols-[auto_minmax(0,1fr)_auto] items-center text-left cursor-pointer hover:bg-[var(--gray-50)]"
              >
                <Miniatura url={r.imagem} tamanho={36} rotulo={r.nome ?? "Anúncio"} />
                <span className="min-w-0">
                  <span className="block text-sm truncate" style={{ color: "var(--text)" }}>{r.nome}</span>
                  <span className="block text-xs truncate" style={{ color: "var(--text-3)" }}>{NOMES_TIPO[r.tipo]} · {r.prestador ?? "Sem parceiro"}</span>
                </span>
                <Plus size={14} style={{ color: "var(--text-3)" }} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EscolherDono({ dono, onEscolher }: { dono: { id: number; nome: string } | null; onEscolher: (d: { id: number; nome: string } | null) => void }) {
  const [termo, setTermo] = useState("");
  const { resultados } = usePesquisa<UsuarioAdmin>(termo, pedirClientes);

  if (dono)
    return (
      <CampoForm rotulo="Dono (opcional)" ajuda="As publicações desta conta que marcam anúncios da coleção aparecem na página. Não lhe dá permissão de editar.">
        <span className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm" style={{ background: "var(--gray-50)", border: "1px solid var(--border)", color: "var(--text)" }}>
          <span className="truncate">{dono.nome} <span style={{ color: "var(--text-3)" }}>#{dono.id}</span></span>
          <button type="button" onClick={() => onEscolher(null)} aria-label="Tirar o dono" className="cursor-pointer" style={{ color: "var(--text-3)" }}><X size={14} /></button>
        </span>
      </CampoForm>
    );

  return (
    <CampoForm rotulo="Dono (opcional)" ajuda="A conta do casal: as publicações dele que marcam estes anúncios aparecem na página.">
      <ToolbarInput type="search" value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Procurar cliente por nome, email ou telefone" />
      {resultados.length > 0 && (
        <ul className="flex flex-col rounded-lg max-h-48 overflow-y-auto" style={{ border: "1px solid var(--border)" }}>
          {resultados.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => {
                  onEscolher({ id: u.id, nome: u.nome ?? `Conta ${u.id}` });
                  setTermo("");
                }}
                className="w-full p-2 text-left text-sm cursor-pointer hover:bg-[var(--gray-50)]"
                style={{ color: "var(--text)" }}
              >
                {u.nome ?? `Conta ${u.id}`} <span style={{ color: "var(--text-3)" }}>{u.email ?? u.telefone ?? ""}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </CampoForm>
  );
}
