"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Play } from "lucide-react";
import { GlobalModal } from "@/components/global/GlobalModal";
import { Etiqueta } from "@/components/admin/AdminUI";
import type { AnuncioPost, EstadoPost, PostMediaAdmin } from "@/types/publicacao.types";

export const NOMES_TIPO_ANUNCIO: Record<AnuncioPost["tipo"], string> = {
  espaco: "Espaço",
  servico: "Serviço",
  combo: "Combo",
};

export function duracao(segundos: number | null) {
  const s = Math.round(segundos ?? 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Imagem de uma média (a miniatura, num vídeo). */
export const imagemDe = (m: Pick<PostMediaAdmin, "tipo" | "url" | "miniaturaUrl">) => (m.tipo === "video" ? m.miniaturaUrl : m.url);

/** Miniatura quadrada; num vídeo mostra o ▶ e a duração. */
export function Miniatura({
  url, video, segundos, tamanho = 48, onClick, rotulo,
}: { url: string | null; video?: boolean; segundos?: number | null; tamanho?: number; onClick?: () => void; rotulo: string }) {
  const [falhou, setFalhou] = useState(false);
  const conteudo = (
    <span
      className="relative block flex-shrink-0 overflow-hidden"
      style={{ width: tamanho, height: tamanho, borderRadius: "var(--r-md)", background: "var(--gray-100)" }}
    >
      {url && !falhou ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" onError={() => setFalhou(true)} />
      ) : (
        <span className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-3)" }}>
          <ImageOff size={16} />
        </span>
      )}
      {video && (
        <span
          className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 px-1 rounded text-[10px] font-semibold"
          style={{ background: "rgba(0,0,0,.65)", color: "#fff", fontVariantNumeric: "tabular-nums" }}
        >
          <Play size={9} fill="currentColor" />
          {segundos ? duracao(segundos) : ""}
        </span>
      )}
    </span>
  );
  return onClick ? (
    <button type="button" onClick={onClick} aria-label={rotulo} className="cursor-pointer rounded-md focus-visible:outline-2" style={{ outlineColor: "var(--blue)" }}>
      {conteudo}
    </button>
  ) : conteudo;
}

/** Fila de miniaturas que abre a média em grande. */
export function FilaMedia({ media, tamanho = 72, maximo = 5 }: { media: PostMediaAdmin[]; tamanho?: number; maximo?: number }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const visiveis = media.slice(0, maximo);
  const resto = media.length - visiveis.length;
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {visiveis.map((m, i) => (
          <Miniatura
            key={m.id}
            url={imagemDe(m)}
            video={m.tipo === "video"}
            segundos={m.duracaoS}
            tamanho={tamanho}
            rotulo={`Ver ${m.tipo === "video" ? "vídeo" : "foto"} ${i + 1} de ${media.length}`}
            onClick={() => setAberta(i)}
          />
        ))}
        {resto > 0 && (
          <button
            type="button"
            onClick={() => setAberta(maximo)}
            className="flex items-center justify-center text-sm font-semibold cursor-pointer"
            style={{ width: tamanho, height: tamanho, borderRadius: "var(--r-md)", background: "var(--gray-100)", color: "var(--text-2)" }}
          >
            +{resto}
          </button>
        )}
      </div>
      <VisualizadorMedia media={media} indice={aberta} onFechar={() => setAberta(null)} onMudar={setAberta} />
    </>
  );
}

/** Foto ou vídeo em grande, com setas entre ficheiros. */
export function VisualizadorMedia({
  media, indice, onFechar, onMudar,
}: { media: PostMediaAdmin[]; indice: number | null; onFechar: () => void; onMudar: (i: number) => void }) {
  const m = indice !== null ? media[indice] : null;
  return (
    <GlobalModal
      open={indice !== null}
      onOpenChange={(o) => !o && onFechar()}
      title={m ? `${m.tipo === "video" ? "Vídeo" : "Foto"} ${indice! + 1} de ${media.length}` : undefined}
      size="xl"
    >
      {m && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center" style={{ background: "#111", borderRadius: "var(--r-md)", minHeight: 320 }}>
            {m.estado !== "pronto" || !m.url ? (
              <p className="text-sm p-6 text-center" style={{ color: "#ddd" }}>
                {m.estado === "falhou" ? `Falhou: ${m.erro ?? "não foi possível preparar o ficheiro."}` : "Ainda a ser preparado…"}
              </p>
            ) : m.tipo === "video" ? (
              <video key={m.url} src={m.url} poster={m.miniaturaUrl ?? undefined} controls playsInline className="max-h-[65vh] max-w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt="" className="max-h-[65vh] max-w-full object-contain" />
            )}
          </div>
          {media.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={indice === 0}
                onClick={() => onMudar(indice! - 1)}
                className="inline-flex items-center gap-1 text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-default"
                style={{ color: "var(--text-2)" }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>
                {m.largura && m.altura ? `${m.largura}×${m.altura}` : ""}
                {m.tipo === "video" && m.duracaoS ? ` · ${duracao(m.duracaoS)}` : ""}
              </span>
              <button
                type="button"
                disabled={indice === media.length - 1}
                onClick={() => onMudar(indice! + 1)}
                className="inline-flex items-center gap-1 text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-default"
                style={{ color: "var(--text-2)" }}
              >
                Seguinte <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </GlobalModal>
  );
}

export function ListaAnuncios({ anuncios }: { anuncios: AnuncioPost[] }) {
  if (!anuncios.length) return <span style={{ color: "var(--text-3)" }}>—</span>;
  return (
    <ul className="flex flex-wrap gap-1">
      {anuncios.map((a) => (
        <li
          key={`${a.tipo}${a.id}`}
          className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
          style={{ background: "var(--gray-50)", border: "1px solid var(--border)", color: "var(--text-2)" }}
          title={`${NOMES_TIPO_ANUNCIO[a.tipo]} #${a.id}`}
        >
          {a.nome?.trim() || `${NOMES_TIPO_ANUNCIO[a.tipo]} #${a.id}`}
        </li>
      ))}
    </ul>
  );
}

const ESTADOS: Record<EstadoPost, { rotulo: string; tom: "neutro" | "sucesso" | "aviso" | "perigo" | "info" }> = {
  rascunho: { rotulo: "Rascunho", tom: "neutro" },
  em_revisao: { rotulo: "Para rever", tom: "aviso" },
  publicado: { rotulo: "Publicada", tom: "sucesso" },
  recusado: { rotulo: "Recusada", tom: "perigo" },
  removido: { rotulo: "Retirada", tom: "perigo" },
};

export function EstadoPostEtiqueta({ estado }: { estado: EstadoPost }) {
  const e = ESTADOS[estado];
  return <Etiqueta tom={e.tom}>{e.rotulo}</Etiqueta>;
}

export function AutorTipo({ tipo }: { tipo: "cliente" | "parceiro" }) {
  return <Etiqueta tom={tipo === "cliente" ? "info" : "neutro"}>{tipo === "cliente" ? "Cliente" : "Parceiro"}</Etiqueta>;
}
