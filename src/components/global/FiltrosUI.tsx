"use client";
import { AlertTriangle } from "lucide-react";

/* ── Abas segmentadas (filtro por estado) ───────────────────── */

interface FilterTabsProps<T extends string> {
  tabs: readonly { id: T; label: string }[];
  ativa: T;
  onChange: (id: T) => void;
  contadores?: Partial<Record<T, number>>;
}

export function FilterTabs<T extends string>({ tabs, ativa, onChange, contadores }: FilterTabsProps<T>) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto" style={{ borderBottom: "1px solid var(--border)" }}>
      {tabs.map((tab) => {
        const selecionada = tab.id === ativa;
        const n = contadores?.[tab.id];
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={selecionada}
            onClick={() => onChange(tab.id)}
            className="px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap"
            style={{
              color: selecionada ? "var(--blue-700)" : "var(--text-3)",
              borderBottom: selecionada ? "2px solid var(--blue)" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
            {!!n && n > 0 && (
              <span
                className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--warning-bg)", color: "var(--warning-fg)", fontVariantNumeric: "tabular-nums" }}
              >
                {n}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Controlos compactos da barra da tabela ────────────────── */

const CONTROLO: React.CSSProperties = {
  height: "var(--control-h-sm)",
  background: "var(--gray-50)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  fontSize: "var(--font-sm)",
  color: "var(--text)",
  padding: "0 10px",
  outline: "none",
};

export function ToolbarSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...CONTROLO, paddingRight: 28, cursor: "pointer", ...props.style }} />;
}

export function ToolbarInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...CONTROLO, ...props.style }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; props.onBlur?.(e); }}
    />
  );
}

/* ── Erro inline com nova tentativa ────────────────────────── */

export function ErroCarregamento({ mensagem, onRetry }: { mensagem: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", color: "var(--danger-fg)" }}
    >
      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-semibold">Não foi possível carregar os dados</p>
        <p>{mensagem}</p>
      </div>
      <button onClick={onRetry} className="text-sm font-semibold underline cursor-pointer">
        Tentar novamente
      </button>
    </div>
  );
}

/* ── Motivo obrigatório (rejeitar/suspender) ───────────────── */

interface CampoMotivoProps {
  id: string;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string | null;
  ajuda: string;
  placeholder?: string;
}

export function CampoMotivo({ id, valor, onChange, erro, ajuda, placeholder }: CampoMotivoProps) {
  return (
    <>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
        Motivo <span style={{ color: "var(--danger)" }}>*</span>
      </label>
      <textarea
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={300}
        aria-invalid={!!erro}
        aria-describedby={`${id}-ajuda`}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y"
        style={{ border: `1px solid ${erro ? "var(--danger)" : "var(--border-strong)"}`, background: "var(--surface)", color: "var(--text)" }}
        placeholder={placeholder}
      />
      <p id={`${id}-ajuda`} className="text-xs mt-1.5" style={{ color: erro ? "var(--danger-fg)" : "var(--text-3)" }}>
        {erro ?? ajuda}
      </p>
    </>
  );
}
