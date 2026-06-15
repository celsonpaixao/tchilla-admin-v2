import { cn } from "@/lib/utils";

/* Sparklines estáticos — pontos ascendentes ou descendentes como no DS */
const SPARK_UP   = "0,28 14,24 28,26 42,16 56,18 70,8 84,6";
const SPARK_DOWN = "0,8 14,10 28,6 42,14 56,12 70,18 84,16";

function Spark({ up, accent }: { up: boolean; accent?: boolean }) {
  const stroke = accent ? "#C81E5E" : "#0A6F9E"; // pink-700 | blue-700 — exatos do DS
  return (
    <svg
      viewBox="0 0 84 34"
      fill="none"
      style={{ position: "absolute", right: 14, bottom: 12, width: 84, height: 34, opacity: 0.9 }}
    >
      <polyline
        points={up ? SPARK_UP : SPARK_DOWN}
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Chevron SVG igual ao DS: viewBox 24×24, stroke-width 3 */
function ChevronUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  /** true → borda/ícone pink (accent) */
  accent?: boolean;
  /** % vs. mês anterior — positivo=up, negativo=down */
  delta?: number;
  deltaLabel?: string;
  /** unidade exibida em <small> após o valor ex: "M Kz" ou "%" */
  suffix?: string;
  /** mostrar sparkline decorativa */
  spark?: boolean;
  className?: string;
}

export function KPICard({
  label,
  value,
  icon,
  accent,
  delta,
  deltaLabel = "vs. mês anterior",
  suffix,
  spark,
  className,
}: KPICardProps) {
  const isUp   = delta !== undefined && delta >= 0;
  const isDown = delta !== undefined && delta < 0;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background:    "var(--surface)",
        border:        "1px solid var(--border)",
        borderTop:     `3px solid ${accent ? "var(--accent)" : "var(--blue)"}`,
        borderRadius:  "var(--r-lg)",
        padding:       "16px 17px",
        boxShadow:     "var(--shadow-xs)",
      }}
    >
      {/* .top — ícone + label lado a lado, gap: 9px */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        {/* .ico — 30×30, r-sm (5px) */}
        <span
          style={{
            width:           30,
            height:          30,
            borderRadius:    "var(--r-sm)",
            display:         "grid",
            placeItems:      "center",
            background:      accent ? "var(--pink-50)"  : "var(--blue-50)",
            color:           accent ? "var(--pink-700)" : "var(--blue-700)",
            flexShrink:      0,
          }}
        >
          {icon}
        </span>
        {/* .k — 12px, text-3, fw600 */}
        <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, lineHeight: 1.3 }}>
          {label}
        </span>
      </div>

      {/* .v.num — Sora 27px, navy, letter-spacing -0.02em, tabular-nums */}
      <div
        style={{
          fontFamily:        "var(--display)",
          fontWeight:        700,
          fontSize:          27,
          letterSpacing:     "-0.02em",
          color:             "var(--heading)",
          marginTop:         11,
          fontVariantNumeric:"tabular-nums",
          fontFeatureSettings:"\"tnum\"",
          lineHeight:        1.1,
        }}
      >
        {value}
        {suffix && (
          <small style={{ fontSize: 14, color: "var(--text-3)", fontWeight: 600, marginLeft: 4 }}>
            {suffix}
          </small>
        )}
      </div>

      {/* .delta — inline-flex, gap 3px, fw700, mt 7px */}
      {delta !== undefined && (
        <div
          style={{
            display:     "inline-flex",
            alignItems:  "center",
            gap:         3,
            fontSize:    12,
            fontWeight:  700,
            marginTop:   7,
            color: isUp ? "var(--success-fg)" : isDown ? "var(--danger-fg)" : "var(--text-3)",
          }}
        >
          {isUp   && <ChevronUp />}
          {isDown && <ChevronDown />}
          {Math.abs(delta)}%
          {/* .delta span — muted, fw500, ml 3px */}
          <span style={{ color: "var(--text-3)", fontWeight: 500, marginLeft: 3 }}>
            {deltaLabel}
          </span>
        </div>
      )}

      {/* .spark — absoluto bottom-right, 84×34, opacity .9 */}
      {spark && <Spark up={isUp || delta === undefined} accent={accent} />}
    </div>
  );
}
