"use client";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/types/common.types";
import type { DestaqueAdmin, PostAdmin } from "@/types/publicacao.types";
import { atualizarDestaque, criarDestaque, removerDestaque } from "@/actions/publicacao.actions";
import { GlobalButton } from "@/components/global/GlobalButton";
import { ConfirmModal, GlobalModal } from "@/components/global/GlobalModal";
import { ErroCarregamento } from "@/components/global/FiltrosUI";
import { Etiqueta, Vazio } from "@/components/admin/AdminUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { AutorTipo, ListaAnuncios, Miniatura } from "./PostUI";

/* datetime-local ↔ ISO (o back-end guarda em UTC). */
const paraCampo = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const paraIso = (valor: string) => (valor ? new Date(valor).toISOString() : null);

const ESTILO_CAMPO: React.CSSProperties = {
  height: "var(--control-h-sm)",
  background: "var(--gray-50)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  fontSize: "var(--font-sm)",
  color: "var(--text)",
  padding: "0 10px",
};

/** Rótulo sempre por cima do campo (regras de UI). */
function CampoForm({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: "var(--text-2)" }}>
      <span>{rotulo}</span>
      {children}
    </label>
  );
}

function estadoDestaque(d: DestaqueAdmin): { rotulo: string; tom: "sucesso" | "info" | "neutro" | "perigo" } {
  if (d.post.estado !== "publicado") return { rotulo: "Publicação retirada", tom: "perigo" };
  if (d.ativo) return { rotulo: "Na home agora", tom: "sucesso" };
  if (d.ativoDe && new Date(d.ativoDe) > new Date()) return { rotulo: "Agendado", tom: "info" };
  return { rotulo: "Terminado", tom: "neutro" };
}

/*
 * Secção curada da home da app (sem feed): a equipa escolhe, ordena e, se quiser, define a janela.
 * A app mostra só os que estão "Na home agora", pela ordem.
 */
export function DestaquesLista({ destaques }: { destaques: ActionResult<DestaqueAdmin[]> }) {
  const { recarregar } = useFiltrosUrl();
  const [linhas, setLinhas] = useState<DestaqueAdmin[]>(destaques.success ? destaques.data : []);
  useEffect(() => setLinhas(destaques.success ? destaques.data : []), [destaques]);
  const [removerAlvo, setRemoverAlvo] = useState<DestaqueAdmin | null>(null);
  const [aGravar, startGravar] = useTransition();

  if (!destaques.success) return <ErroCarregamento mensagem={destaques.error} onRetry={recarregar} />;

  function remover() {
    if (!removerAlvo) return;
    const alvo = removerAlvo;
    startGravar(async () => {
      const res = await removerDestaque(alvo.id);
      if (!res.success) {
        toast.error("Não foi possível tirar dos destaques", { description: res.error });
        return;
      }
      setLinhas((prev) => prev.filter((x) => x.id !== alvo.id));
      setRemoverAlvo(null);
      toast.success("Tirada dos destaques", { description: "A publicação continua na página dos anúncios." });
      recarregar();
    });
  }

  if (linhas.length === 0)
    return (
      <div className="rounded-lg p-6" style={{ border: "1px solid var(--border)", background: "var(--surface, #fff)" }}>
        <Vazio mensagem="Ainda não há destaques na home. Escolhe publicações no separador Publicadas, com o botão Destacar." />
      </div>
    );

  return (
    <>
      <ul className="flex flex-col gap-2">
        {linhas.map((d) => (
          <LinhaDestaque key={d.id} destaque={d} onAtualizado={(n) => setLinhas((prev) => prev.map((x) => (x.id === n.id ? n : x)))} onRemover={() => setRemoverAlvo(d)} />
        ))}
      </ul>
      <ConfirmModal
        open={!!removerAlvo}
        onOpenChange={(o) => !o && setRemoverAlvo(null)}
        title="Tirar esta publicação dos destaques?"
        description="Deixa de aparecer na home da app. Continua visível na página dos anúncios a que está ligada."
        onConfirm={remover}
        loading={aGravar}
        confirmLabel="Tirar dos destaques"
      />
    </>
  );
}

function LinhaDestaque({ destaque, onAtualizado, onRemover }: { destaque: DestaqueAdmin; onAtualizado: (d: DestaqueAdmin) => void; onRemover: () => void }) {
  const [ordem, setOrdem] = useState(String(destaque.ordem));
  const [de, setDe] = useState(paraCampo(destaque.ativoDe));
  const [ate, setAte] = useState(paraCampo(destaque.ativoAte));
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, startGravar] = useTransition();
  const alterado = ordem !== String(destaque.ordem) || de !== paraCampo(destaque.ativoDe) || ate !== paraCampo(destaque.ativoAte);
  const estado = estadoDestaque(destaque);

  function guardar() {
    setErro(null);
    startGravar(async () => {
      const res = await atualizarDestaque(destaque.id, { postId: destaque.post.id, ordem: Number(ordem) || 0, ativoDe: paraIso(de), ativoAte: paraIso(ate) });
      if (!res.success) {
        setErro(res.error);
        return;
      }
      onAtualizado(res.data);
      toast.success("Destaque guardado");
    });
  }

  return (
    <li className="grid gap-3 p-3 rounded-lg md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center" style={{ border: "1px solid var(--border)", background: "var(--surface, #fff)" }}>
      <Miniatura url={destaque.post.capa} tamanho={64} rotulo="Capa" />
      <div className="min-w-0 flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Etiqueta tom={estado.tom}>{estado.rotulo}</Etiqueta>
          <span className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{destaque.post.autorNome ?? "—"}</span>
          <AutorTipo tipo={destaque.post.autorTipo} />
        </div>
        <p className="text-sm line-clamp-1" style={{ color: destaque.post.legenda ? "var(--text-2)" : "var(--text-3)" }}>{destaque.post.legenda?.trim() || "Sem legenda"}</p>
        <ListaAnuncios anuncios={destaque.post.anuncios} />
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <CampoForm rotulo="Ordem">
          <input type="number" min={0} value={ordem} onChange={(e) => setOrdem(e.target.value)} className="w-16" style={ESTILO_CAMPO} aria-label="Ordem na home" />
        </CampoForm>
        <CampoForm rotulo="A partir de (opcional)">
          <input type="datetime-local" value={de} onChange={(e) => setDe(e.target.value)} style={ESTILO_CAMPO} />
        </CampoForm>
        <CampoForm rotulo="Até (opcional)">
          <input type="datetime-local" value={ate} onChange={(e) => setAte(e.target.value)} style={ESTILO_CAMPO} />
        </CampoForm>
        <GlobalButton size="sm" variant="secondary" disabled={!alterado} loading={aGravar} onClick={guardar}>Guardar</GlobalButton>
        <GlobalButton size="sm" variant="ghost" onClick={onRemover}>Tirar</GlobalButton>
        {erro && <p className="w-full text-xs" style={{ color: "var(--danger-fg)" }}>{erro}</p>}
      </div>
    </li>
  );
}

/** Pôr uma publicação nos destaques da home. */
export function DestacarModal({ post, onFechar, onCriado }: { post: PostAdmin | null; onFechar: () => void; onCriado: () => void }) {
  const [ordem, setOrdem] = useState("0");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, startGravar] = useTransition();

  useEffect(() => {
    if (!post) return;
    setOrdem("0");
    setDe("");
    setAte("");
    setErro(null);
  }, [post]);

  function confirmar() {
    if (!post) return;
    setErro(null);
    startGravar(async () => {
      const res = await criarDestaque({ postId: post.id, ordem: Number(ordem) || 0, ativoDe: paraIso(de), ativoAte: paraIso(ate) });
      if (!res.success) {
        setErro(res.error);
        return;
      }
      toast.success("Publicação nos destaques da home", { description: res.data.ativo ? "Já aparece na app." : "Aparece quando começar a janela escolhida." });
      onCriado();
    });
  }

  return (
    <GlobalModal
      open={!!post}
      onOpenChange={(o) => !o && onFechar()}
      title="Destacar na home"
      description="A publicação aparece na secção curada da home da app, pela ordem (o número mais baixo primeiro)."
      footer={
        <>
          <GlobalButton variant="ghost" onClick={onFechar}>Cancelar</GlobalButton>
          <GlobalButton variant="accent" loading={aGravar} onClick={confirmar}>Destacar publicação</GlobalButton>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <CampoForm rotulo="Ordem">
          <input type="number" min={0} value={ordem} onChange={(e) => setOrdem(e.target.value)} className="w-24" style={ESTILO_CAMPO} />
        </CampoForm>
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoForm rotulo="A partir de (opcional)">
            <input type="datetime-local" value={de} onChange={(e) => setDe(e.target.value)} style={ESTILO_CAMPO} />
          </CampoForm>
          <CampoForm rotulo="Até (opcional)">
            <input type="datetime-local" value={ate} onChange={(e) => setAte(e.target.value)} style={ESTILO_CAMPO} />
          </CampoForm>
        </div>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>Sem datas, fica na home até a tirares.</p>
        {erro && <p className="text-xs" style={{ color: "var(--danger-fg)" }}>{erro}</p>}
      </div>
    </GlobalModal>
  );
}
