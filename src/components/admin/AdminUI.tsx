"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Download, Search, Star } from "lucide-react";
import { ToolbarInput } from "@/components/global/FiltrosUI";
import { formatDate } from "@/lib/utils";
import type { ParceiroResumo, PessoaAdmin } from "@/types/admin.types";

/* ── Pesquisa no servidor, 400 ms depois de parar de escrever ─ */

export function usePesquisaServidor(
  inicial: string | undefined,
  atualizar: (m: Record<string, string | undefined>) => void,
  queryAtual: () => URLSearchParams,
) {
  const [pesquisa, setPesquisa] = useState(inicial ?? "");
  useEffect(() => {
    const t = setTimeout(() => {
      const atual = queryAtual().get("q") ?? "";
      if (atual !== pesquisa.trim()) atualizar({ q: pesquisa.trim() || undefined });
    }, 400);
    return () => clearTimeout(t);
  }, [pesquisa, atualizar, queryAtual]);
  return [pesquisa, setPesquisa] as const;
}

export function CampoPesquisa({
  valor, onChange, placeholder, rotulo,
}: { valor: string; onChange: (v: string) => void; placeholder: string; rotulo: string }) {
  return (
    <div className="relative flex-1 min-w-[200px] max-w-xs">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }} />
      <ToolbarInput
        type="search"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={rotulo}
        style={{ width: "100%", paddingLeft: 32 }}
      />
    </div>
  );
}

export function CamposPeriodo({
  de, ate, onChange, rotulo = "",
}: { de?: string; ate?: string; onChange: (m: { de?: string; ate?: string }) => void; rotulo?: string }) {
  return (
    <>
      <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
        {rotulo ? `${rotulo} de` : "De"}
        <ToolbarInput type="date" value={de ?? ""} max={ate} onChange={(e) => onChange({ de: e.target.value || undefined })} />
      </label>
      <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
        Até
        <ToolbarInput type="date" value={ate ?? ""} min={de} onChange={(e) => onChange({ ate: e.target.value || undefined })} />
      </label>
    </>
  );
}

/* ── Estado vazio com o passo seguinte (regra R6) ────────────── */

export function Vazio({ mensagem, onLimpar }: { mensagem: string; onLimpar?: () => void }) {
  return (
    <div className="space-y-2">
      <p>{mensagem}</p>
      {onLimpar && (
        <button className="text-sm font-semibold cursor-pointer" style={{ color: "var(--blue-700)" }} onClick={onLimpar}>
          Limpar filtros
        </button>
      )}
    </div>
  );
}

/* ── Exportar CSV com os filtros atuais ──────────────────────── */

export function BotaoExportar({ recurso, query, rotulo = "Exportar CSV" }: { recurso: "reservas" | "pagamentos"; query: string; rotulo?: string }) {
  return (
    <a
      href={`/api/exportar/${recurso}${query ? `?${query}` : ""}`}
      className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-3 cursor-pointer"
      style={{ height: "var(--control-h)", border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)" }}
      download
    >
      <Download size={15} /> {rotulo}
    </a>
  );
}

/* ── Blocos das páginas de detalhe ───────────────────────────── */

export function Migalhas({ itens }: { itens: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Localização" className="flex items-center gap-1 text-xs flex-wrap" style={{ color: "var(--text-3)" }}>
      {itens.map((i, n) => (
        <span key={i.label} className="flex items-center gap-1">
          {n > 0 && <ChevronRight size={12} aria-hidden />}
          {i.href ? (
            <Link href={i.href} className="hover:underline" style={{ color: "var(--blue-700)" }}>{i.label}</Link>
          ) : (
            <span aria-current="page">{i.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Cartao({ titulo, acao, children }: { titulo: string; acao?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)" }}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm py-1">
      <dt style={{ color: "var(--text-3)" }}>{rotulo}</dt>
      <dd className="text-right min-w-0 break-words" style={{ color: "var(--text)" }}>{children}</dd>
    </div>
  );
}

export function Mono({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-2)" }}>{children}</span>;
}

export function LinkInterno({ href, children, titulo }: { href: string; children: React.ReactNode; titulo?: string }) {
  return (
    <Link href={href} title={titulo} className="hover:underline" style={{ color: "var(--blue-700)" }}>
      {children}
    </Link>
  );
}

export function Pessoa({ pessoa, href }: { pessoa?: PessoaAdmin | null; href?: string }) {
  if (!pessoa) return <span style={{ color: "var(--text-3)" }}>—</span>;
  const nome = pessoa.nome?.trim() || `Utilizador #${pessoa.id}`;
  return (
    <div className="min-w-0 max-w-[180px]" title={pessoa.email ?? undefined}>
      <p className="font-medium truncate" style={{ color: "var(--text)" }}>
        {href ? <LinkInterno href={href}>{nome}</LinkInterno> : nome}
      </p>
      {pessoa.email && <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{pessoa.email}</p>}
    </div>
  );
}

export function nomeParceiroResumo(p?: ParceiroResumo | null) {
  return p ? p.nome?.trim() || `Parceiro #${p.id}` : "—";
}

export function Parceiros({ lista }: { lista: ParceiroResumo[] }) {
  if (lista.length === 0) return <span style={{ color: "var(--text-3)" }}>—</span>;
  return (
    <span className="block truncate max-w-[180px]" title={lista.map(nomeParceiroResumo).join(", ")}>
      {lista.map(nomeParceiroResumo).join(", ")}
    </span>
  );
}

/** Nota de 1 a 5 com número e estrela (nunca só cor, regra R4). */
export function Nota({ valor }: { valor: number }) {
  const cor = valor <= 2 ? "var(--danger-fg)" : valor === 3 ? "var(--warning-fg)" : "var(--success-fg)";
  return (
    <span className="inline-flex items-center gap-1 font-semibold" style={{ color: cor, fontVariantNumeric: "tabular-nums" }}>
      <Star size={13} fill="currentColor" aria-hidden /> {valor.toLocaleString("pt-AO", { maximumFractionDigits: 2 })}
      <span className="sr-only">de 5</span>
    </span>
  );
}

/** Etiqueta neutra com ponto (texto + forma, regra R4). */
export function Etiqueta({ children, tom = "neutro" }: { children: React.ReactNode; tom?: "neutro" | "sucesso" | "aviso" | "perigo" | "info" }) {
  const estilos: Record<string, React.CSSProperties> = {
    neutro: { background: "var(--gray-100)", color: "var(--text-2)", border: "1px solid var(--border)" },
    sucesso: { background: "var(--success-bg)", color: "var(--success-fg)", border: "1px solid var(--success-bd)" },
    aviso: { background: "var(--warning-bg)", color: "var(--warning-fg)", border: "1px solid var(--warning-bd)" },
    perigo: { background: "var(--danger-bg)", color: "var(--danger-fg)", border: "1px solid var(--danger-bd)" },
    info: { background: "var(--info-bg)", color: "var(--info-fg)", border: "1px solid var(--info-bd)" },
  };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style={estilos[tom]}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor", opacity: 0.7 }} />
      {children}
    </span>
  );
}

export function DataCurta({ valor, comHora }: { valor?: string | null; comHora?: boolean }) {
  if (!valor) return <span style={{ color: "var(--text-3)" }}>—</span>;
  return (
    <span className="whitespace-nowrap" style={{ fontVariantNumeric: "tabular-nums" }}>
      {formatDate(valor, comHora ? "dd/MM/yy HH:mm" : "dd MMM yyyy")}
    </span>
  );
}

export function Numero({ valor }: { valor: number }) {
  return <span className="block text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{valor.toLocaleString("pt-AO")}</span>;
}

export const NOMES_ALVO: Record<string, string> = {
  espaco: "Espaço",
  servico: "Serviço",
  combo: "Combo",
  evento: "Evento",
  misto: "Vários",
};
