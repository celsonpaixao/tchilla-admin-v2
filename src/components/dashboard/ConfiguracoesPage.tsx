"use client";
import { useTransition } from "react";
import { LogOut, Shield, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UsuarioInterface } from "@/types/user.types";
import { GlobalAvatar } from "@/components/global/GlobalAvatar";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import type { ThemeStyle, ThemeDensity, ThemeDir } from "@/stores/themeStore";
import { PageShell } from "@/components/global/PageShell";

interface ConfiguracoesPageProps {
  user: UsuarioInterface | null;
}

/* ── Segmented control (style idêntico ao twk-seg do DS) ─────── */
function TwkSeg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const n = options.length;
  return (
    <div
      role="radiogroup"
      style={{
        position: "relative", display: "flex", padding: 2,
        borderRadius: 8, background: "rgba(0,0,0,.06)", userSelect: "none",
      }}
    >
      {/* thumb deslizante */}
      <div
        style={{
          position: "absolute", top: 2, bottom: 2,
          left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
          width: `calc((100% - 4px) / ${n})`,
          borderRadius: 6,
          background: "rgba(255,255,255,.9)",
          boxShadow: "0 1px 2px rgba(0,0,0,.12)",
          transition: "left .15s cubic-bezier(.3,.7,.4,1), width .15s",
          pointerEvents: "none",
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          style={{
            position: "relative", zIndex: 1, flex: 1,
            border: 0, background: "transparent",
            color: "var(--text)", fontWeight: 500,
            minHeight: 22, borderRadius: 6,
            cursor: "pointer", padding: "4px 6px",
            fontSize: 12, lineHeight: 1.2,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Chips de cor (style idêntico ao twk-chip do DS) ──────────── */
function isLight(hex: string): boolean {
  const h = hex.replace("#", "").padEnd(6, "0");
  const n = parseInt(h.slice(0, 6), 16);
  if (isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

function TwkChips({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {options.map((color) => {
        const on = value.toLowerCase() === color.toLowerCase();
        const light = isLight(color);
        return (
          <button
            key={color}
            type="button"
            aria-pressed={on}
            title={color}
            onClick={() => onChange(color)}
            style={{
              flex: 1, height: 46, padding: 0, border: 0,
              borderRadius: 6, background: color, cursor: "pointer",
              position: "relative", overflow: "hidden",
              boxShadow: on
                ? "0 0 0 1.5px rgba(0,0,0,.85), 0 2px 6px rgba(0,0,0,.15)"
                : "0 0 0 .5px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.06)",
              transition: "transform .12s cubic-bezier(.3,.7,.4,1), box-shadow .12s",
            }}
            onMouseEnter={(e) => {
              if (!on) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
            }}
          >
            {on && (
              <svg
                viewBox="0 0 14 14"
                style={{ position: "absolute", top: 6, left: 6, width: 13, height: 13 }}
              >
                <path
                  d="M3 7.2 5.8 10 11 4.2"
                  fill="none"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke={light ? "rgba(0,0,0,.78)" : "#fff"}
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Helpers de layout ────────────────────────────────────────── */
const S = {
  sect: {
    fontSize: 10, fontWeight: 600, letterSpacing: ".06em",
    textTransform: "uppercase" as const, color: "var(--text-3)",
    paddingTop: 4,
  },
  row: { display: "flex", flexDirection: "column" as const, gap: 5 },
  lbl: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
  },
  lblTxt: { fontWeight: 500, fontSize: 12, color: "var(--text-2)" } as React.CSSProperties,
  val: {
    fontSize: 11.5, color: "var(--text-3)",
    fontVariantNumeric: "tabular-nums" as const,
  },
};

/* ── Página ───────────────────────────────────────────────────── */
export function ConfiguracoesPage({ user }: ConfiguracoesPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    style, density, radiusBase, direction,
    primaryColor, accentColor,
    setStyle, setDensity, setRadius, setDirection,
    setPrimary, setAccent,
  } = useThemeStore();

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Até logo!");
      router.push(ROUTES.LOGIN);
      router.refresh();
    });
  }

  if (!user) return null;

  return (
    <PageShell title="Configurações" subtitle="Informações da sua conta">

      {/* Grid 2 colunas em desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Coluna esquerda: conta ─────────────────────── */}
        <div className="space-y-5">

          {/* Perfil */}
          <div
            className="rounded-xl p-6 space-y-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-4">
              <GlobalAvatar src={user.foto} name={user.nome} size="xl" />
              <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                  {user.nome}
                </h2>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1"
                  style={{ background: "var(--info-bg)", color: "var(--info-fg)" }}
                >
                  <Shield size={11} />
                  {user.tipo}
                </span>
              </div>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              {[
                { icon: <Mail size={14} />,   label: "Email",         value: user.email },
                { icon: <Phone size={14} />,  label: "Telefone",      value: user.telefone },
                { icon: <User size={14} />,   label: "ID",            value: `#${user.id}` },
                { icon: <Shield size={14} />, label: "Verificado",    value: user.verificado ? "Sim" : "Não" },
                { icon: <User size={14} />,   label: "Membro desde",  value: formatDate(user.dataCriacao) },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "var(--text-3)" }}>{item.icon}</span>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>{item.label}</p>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sobre o sistema */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Sobre o sistema
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Versão",    value: "2.0.0 (Next.js)" },
                { label: "Ambiente",  value: process.env.NODE_ENV === "production" ? "Produção" : "Homologação" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>{item.label}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sair */}
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all disabled:opacity-60"
            style={{ background: "var(--danger-bg)", color: "var(--danger-fg)", border: "1px solid var(--danger-bd)" }}
          >
            <LogOut size={15} />
            {isPending ? "Saindo…" : "Sair da conta"}
          </button>

        </div>{/* fim coluna esquerda */}

        {/* ── Coluna direita: aparência ──────────────────── */}
        <div className="lg:sticky" style={{ top: "calc(var(--topbar-height) + 24px)" }}>
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
            >
              <h3
                style={{
                  fontSize: 13, fontWeight: 600,
                  color: "var(--text)", margin: 0,
                }}
              >
                Aparência
              </h3>
              <p style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                Alterações aplicam-se imediatamente.
              </p>
            </div>

            {/* Body — padding e gap idênticos ao twk-body */}
            <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

              {/* ── SECÇÃO ESTILO ── */}
              <div style={S.sect}>Estilo</div>

              <div style={S.row}>
                <div style={S.lbl}>
                  <span style={S.lblTxt}>Modo</span>
                </div>
                <TwkSeg<ThemeStyle>
                  value={style}
                  options={[
                    { value: "minimal",    label: "Minimal" },
                    { value: "expressive", label: "Expressivo" },
                  ]}
                  onChange={setStyle}
                />
              </div>

              <div style={S.row}>
                <div style={S.lbl}>
                  <span style={S.lblTxt}>Densidade</span>
                </div>
                <TwkSeg<ThemeDensity>
                  value={density}
                  options={[
                    { value: "compact", label: "Compacta" },
                    { value: "comfy",   label: "Confortável" },
                  ]}
                  onChange={setDensity}
                />
              </div>

              <div style={S.row}>
                <div style={S.lbl}>
                  <span style={S.lblTxt}>Raio base</span>
                  <span style={S.val}>{radiusBase}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={16}
                  step={1}
                  value={radiusBase}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  style={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    appearance: "none" as any,
                    WebkitAppearance: "none",
                    width: "100%",
                    height: 4,
                    marginTop: 6,
                    borderRadius: 999,
                    background: `linear-gradient(to right, var(--blue) ${(radiusBase / 16) * 100}%, rgba(0,0,0,.12) ${(radiusBase / 16) * 100}%)`,
                    outline: "none",
                    cursor: "pointer",
                  }}
                />
              </div>

              <div style={S.row}>
                <div style={S.lbl}>
                  <span style={S.lblTxt}>Direção</span>
                </div>
                <TwkSeg<ThemeDir>
                  value={direction}
                  options={[
                    { value: "ltr", label: "Esq → Dir" },
                    { value: "rtl", label: "Dir → Esq" },
                  ]}
                  onChange={setDirection}
                />
              </div>

              {/* ── SECÇÃO COR ── */}
              <div style={{ ...S.sect, paddingTop: 12 }}>Cor</div>

              <div style={S.row}>
                <div style={S.lbl}>
                  <span style={S.lblTxt}>Ação (azul)</span>
                </div>
                <TwkChips
                  value={primaryColor}
                  options={["#14AAE9", "#0A6F9E", "#0E2A42"]}
                  onChange={setPrimary}
                />
              </div>

              <div style={S.row}>
                <div style={S.lbl}>
                  <span style={S.lblTxt}>Acento (rosa)</span>
                </div>
                <TwkChips
                  value={accentColor}
                  options={["#FF4D8D", "#F25C9C", "#E8638F"]}
                  onChange={setAccent}
                />
              </div>

            </div>
          </div>
        </div>{/* fim coluna direita */}

      </div>{/* fim grid */}
    </PageShell>
  );
}
