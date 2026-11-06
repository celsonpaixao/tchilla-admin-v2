"use client";

/* ── Link para documento (comprovativo/fatura) ─────────────── */

export function LinkDocumento({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
      style={{ color: "var(--text-3)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-100)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {icon}
    </a>
  );
}

/** Valor em Kz alinhado à direita, algarismos tabulares (regra R3). */
export function Kz({ valor, forte }: { valor: number; forte?: boolean }) {
  return (
    <span
      className="block text-right"
      style={{ fontVariantNumeric: "tabular-nums", fontWeight: forte ? 600 : 400, color: "var(--text)" }}
    >
      {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 2 }).format(valor)}
    </span>
  );
}

/** Formato compacto para KPIs: 1 284 500 → { valor: "1,28", sufixo: "M Kz" }. */
export function kzCompacto(valor: number): { valor: string; sufixo: string } {
  const fmt = (n: number, casas: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(n);
  if (Math.abs(valor) >= 1_000_000) return { valor: fmt(valor / 1_000_000, 2), sufixo: "M Kz" };
  return { valor: fmt(valor, 0), sufixo: "Kz" };
}
