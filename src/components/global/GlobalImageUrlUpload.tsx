"use client";
import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { carregarImagem } from "@/actions/storage.actions";
import { ToolbarInput } from "@/components/global/FiltrosUI";

type Pasta = "colecoes" | "promocoes" | "campanhas";

interface GlobalImageUrlUploadProps {
  /** Endereço atual da imagem ("" quando não há). */
  value: string;
  onChange: (url: string) => void;
  /** Pasta do storage onde a imagem fica. */
  pasta: Pasta;
  altura?: number;
}

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const LIMITE_BYTES = 10 * 1024 * 1024;
const LADO_MAX = 1920;

/** Fotos de telemóvel chegam com 4–8 MB: reduz para 1920 px antes de subir. GIFs ficam como estão. */
async function reduzir(ficheiro: File): Promise<File> {
  if (ficheiro.type === "image/gif") return ficheiro;
  const bitmap = await createImageBitmap(ficheiro).catch(() => null);
  if (!bitmap) return ficheiro;
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  if (escala === 1 && ficheiro.size < 1.5 * 1024 * 1024) return ficheiro;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", 0.85));
  if (!blob || blob.type !== "image/webp" || blob.size >= ficheiro.size) return ficheiro;
  return new File([blob], ficheiro.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}

/**
 * Campo de imagem que guarda um endereço: sobe o ficheiro para o storage e devolve o URL.
 * Quem já tiver um endereço pode colá-lo em "Colar endereço".
 */
export function GlobalImageUrlUpload({ value, onChange, pasta, altura = 120 }: GlobalImageUrlUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [aCarregar, setACarregar] = useState(false);
  const [arrastar, setArrastar] = useState(false);
  const [colar, setColar] = useState(false);
  const [falhou, setFalhou] = useState(false);

  async function subir(ficheiro: File | undefined) {
    if (!ficheiro) return;
    if (!TIPOS.includes(ficheiro.type)) {
      toast.error("Só aceitamos imagens JPG, PNG, WEBP ou GIF.");
      return;
    }
    if (ficheiro.size > LIMITE_BYTES) {
      toast.error("A imagem tem mais de 10 MB.");
      return;
    }
    setACarregar(true);
    try {
      const dados = new FormData();
      dados.append("file", await reduzir(ficheiro));
      dados.append("pasta", pasta);
      const res = await carregarImagem(dados);
      if (res.success) {
        setFalhou(false);
        setColar(false);
        onChange(res.data);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Não foi possível enviar a imagem. Tenta novamente.");
    } finally {
      setACarregar(false);
    }
  }

  const abrir = () => inputRef.current?.click();

  const ficheiroInput = (
    <input
      ref={inputRef}
      type="file"
      accept={TIPOS.join(",")}
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => {
        void subir(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  const botaoTexto = "inline-flex items-center gap-1 text-xs font-semibold cursor-pointer disabled:opacity-50";

  if (value && !colar) {
    return (
      <div className="flex flex-col gap-1.5">
        {ficheiroInput}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: altura, borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "var(--gray-50)" }}
        >
          {falhou ? (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs" style={{ color: "var(--text-3)" }}>
              Não foi possível mostrar esta imagem. Confirma o endereço ou carrega outra.
            </div>
          ) : (
            // O endereço pode vir de qualquer domínio (colado à mão), por isso não usa next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" onError={() => setFalhou(true)} onLoad={() => setFalhou(false)} />
          )}
          {aCarregar && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,.4)", color: "#fff" }}>
              <Loader2 size={18} className="animate-spin" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className={botaoTexto} style={{ color: "var(--blue)" }} disabled={aCarregar} onClick={abrir}>
            <RefreshCw size={12} /> Trocar
          </button>
          <button type="button" className={botaoTexto} style={{ color: "var(--danger)" }} disabled={aCarregar} onClick={() => { setFalhou(false); onChange(""); }}>
            <Trash2 size={12} /> Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {ficheiroInput}
      <button
        type="button"
        disabled={aCarregar}
        onClick={abrir}
        onDragOver={(e) => { e.preventDefault(); setArrastar(true); }}
        onDragLeave={() => setArrastar(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastar(false);
          void subir(e.dataTransfer.files?.[0]);
        }}
        className="flex w-full flex-col items-center justify-center gap-1.5 cursor-pointer disabled:cursor-wait"
        style={{
          height: altura,
          borderRadius: "var(--r-md)",
          border: `1.5px dashed ${arrastar ? "var(--blue)" : "var(--border-strong)"}`,
          background: arrastar ? "var(--blue-50)" : "var(--gray-50)",
          color: "var(--text-3)",
          transition: "border-color .15s, background .15s",
        }}
      >
        {aCarregar ? (
          <>
            <Loader2 size={20} className="animate-spin" style={{ color: "var(--blue)" }} />
            <span className="text-xs font-medium">A enviar a imagem…</span>
          </>
        ) : (
          <>
            <ImagePlus size={20} style={{ color: arrastar ? "var(--blue)" : "var(--text-3)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>Clica ou arrasta uma imagem</span>
            <span className="text-[11px]">JPG, PNG, WEBP ou GIF · até 10 MB</span>
          </>
        )}
      </button>
      {colar ? (
        <ToolbarInput
          autoFocus
          type="url"
          value={value}
          maxLength={500}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => { if (value.trim()) setColar(false); }}
          placeholder="https://…"
        />
      ) : (
        <button type="button" className={`${botaoTexto} self-start`} style={{ color: "var(--text-3)" }} onClick={() => setColar(true)}>
          <Link2 size={12} /> Já tenho um endereço
        </button>
      )}
    </div>
  );
}
