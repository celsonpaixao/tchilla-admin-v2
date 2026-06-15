"use client";
import { useTransition } from "react";
import { LogOut, Shield, Mail, Phone, User, AlignLeft, AlignRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UsuarioInterface } from "@/types/user.types";
import { GlobalAvatar } from "@/components/global/GlobalAvatar";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import type { ThemeStyle, ThemeDensity, ThemeDir } from "@/stores/themeStore";

interface ConfiguracoesPageProps {
  user: UsuarioInterface | null;
}

/* ── Componente de opção de tema ──────────────────────────── */
function ThemeOption({
  label, description, active, onClick,
}: { label: string; description?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:      "flex",
        flexDirection:"column",
        gap:          4,
        padding:      "12px 14px",
        borderRadius: "var(--r-md)",
        border:       `2px solid ${active ? "var(--blue)" : "var(--border)"}`,
        background:   active ? "var(--blue-50)" : "var(--surface)",
        cursor:       "pointer",
        textAlign:    "left",
        transition:   "border-color .15s, background .15s",
        flex:         1,
      }}
    >
      <span style={{
        fontSize:   13,
        fontWeight: 600,
        color:      active ? "var(--blue-700)" : "var(--text)",
      }}>
        {label}
      </span>
      {description && (
        <span style={{ fontSize: 11.5, color: "var(--text-3)", lineHeight: 1.4 }}>
          {description}
        </span>
      )}
      {/* indicador */}
      {active && (
        <span style={{
          marginTop:    4,
          width:        18,
          height:       18,
          borderRadius: "50%",
          background:   "var(--blue)",
          display:      "grid",
          placeItems:   "center",
        }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

export function ConfiguracoesPage({ user }: ConfiguracoesPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { style, density, radiusBase, direction, setStyle, setDensity, setRadius, setDirection } = useThemeStore();

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
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Configurações</h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>Informações da sua conta</p>
      </div>

      {/* Perfil */}
      <div
        className="rounded-xl p-6 space-y-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <GlobalAvatar src={user.foto} name={user.nome} size="xl" />
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>{user.nome}</h2>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1"
              style={{ background: "var(--info-bg)", color: "var(--info-fg)" }}
            >
              <Shield size={11} />
              {user.tipo}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          {[
            { icon: <Mail size={14} />, label: "Email", value: user.email },
            { icon: <Phone size={14} />, label: "Telefone", value: user.telefone },
            { icon: <User size={14} />, label: "ID", value: `#${user.id}` },
            { icon: <Shield size={14} />, label: "Verificado", value: user.verificado ? "Sim" : "Não" },
            { icon: <User size={14} />, label: "Membro desde", value: formatDate(user.dataCriacao) },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span style={{ color: "var(--text-3)" }}>{item.icon}</span>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>{item.label}</p>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info do app */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Sobre o sistema</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Versão", value: "2.0.0 (Next.js)" },
            { label: "Ambiente", value: process.env.NODE_ENV === "production" ? "Produção" : "Homologação" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>{item.label}</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Aparência ──────────────────────────────────────── */}
      <div
        className="rounded-xl p-6 space-y-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Aparência</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            Personaliza o visual da interface. As alterações aplicam-se imediatamente.
          </p>
        </div>

        {/* Estilo */}
        <div className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: "var(--text-2)", fontFamily: "var(--mono)", letterSpacing: ".08em", textTransform: "uppercase" }}>
            Estilo
          </p>
          <div className="flex gap-3">
            {(["minimal", "expressive"] as ThemeStyle[]).map((s) => (
              <ThemeOption
                key={s}
                label={s === "minimal" ? "Minimal" : "Expressivo"}
                description={s === "minimal" ? "Interface limpa, sombras suaves" : "Sombras ricas com toque rosa"}
                active={style === s}
                onClick={() => setStyle(s)}
              />
            ))}
          </div>
        </div>

        {/* Densidade */}
        <div className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: "var(--text-2)", fontFamily: "var(--mono)", letterSpacing: ".08em", textTransform: "uppercase" }}>
            Densidade
          </p>
          <div className="flex gap-3">
            {(["compact", "comfy"] as ThemeDensity[]).map((d) => (
              <ThemeOption
                key={d}
                label={d === "compact" ? "Compacto" : "Confortável"}
                description={d === "compact" ? "Mais itens visíveis, filas estreitas" : "Mais espaço entre elementos"}
                active={density === d}
                onClick={() => setDensity(d)}
              />
            ))}
          </div>
        </div>

        {/* Raio base */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: "var(--text-2)", fontFamily: "var(--mono)", letterSpacing: ".08em", textTransform: "uppercase" }}>
              Raio base
            </p>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 12,
              color: "var(--blue-700)", fontWeight: 700,
              background: "var(--blue-50)", padding: "2px 10px",
              borderRadius: "var(--r-full)",
            }}>
              {radiusBase}px
            </div>
          </div>

          {/* Presets visuais */}
          <div className="flex gap-2">
            {[0, 4, 8, 12, 16, 20].map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                title={`${r}px`}
                style={{
                  flex:        1,
                  height:      36,
                  borderRadius: r === 0 ? 2 : r,
                  border:      `2px solid ${radiusBase === r ? "var(--blue)" : "var(--border)"}`,
                  background:  radiusBase === r ? "var(--blue-50)" : "var(--surface-2)",
                  cursor:      "pointer",
                  transition:  "border-color .15s, background .15s",
                  display:     "grid",
                  placeItems:  "center",
                }}
              >
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 10,
                  color: radiusBase === r ? "var(--blue-700)" : "var(--text-3)",
                  fontWeight: 700,
                }}>
                  {r}
                </span>
              </button>
            ))}
          </div>

          {/* Slider contínuo */}
          <input
            type="range"
            min={0}
            max={20}
            step={2}
            value={radiusBase}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--blue)", cursor: "pointer" }}
          />

          {/* Preview das formas */}
          <div className="flex items-center gap-3 pt-1">
            {[
              { label: "xs", mult: 0.375 },
              { label: "sm", mult: 0.625 },
              { label: "md", mult: 1 },
              { label: "lg", mult: 1.5 },
              { label: "xl", mult: 2.25 },
            ].map(({ label, mult }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div style={{
                  width:        36,
                  height:       28,
                  borderRadius: Math.round(radiusBase * mult),
                  background:   "var(--blue-100)",
                  border:       "1.5px solid var(--blue-200)",
                }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-3)", textTransform: "uppercase" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Direção */}
        <div className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: "var(--text-2)", fontFamily: "var(--mono)", letterSpacing: ".08em", textTransform: "uppercase" }}>
            Direção
          </p>
          <div className="flex gap-3">
            {([
              { value: "ltr", label: "Esquerda → Direita", icon: <AlignLeft size={14} /> },
              { value: "rtl", label: "Direita → Esquerda", icon: <AlignRight size={14} /> },
            ] as { value: ThemeDir; label: string; icon: React.ReactNode }[]).map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setDirection(value)}
                style={{
                  flex:         1,
                  display:      "flex",
                  alignItems:   "center",
                  gap:          8,
                  padding:      "10px 14px",
                  borderRadius: "var(--r-md)",
                  border:       `2px solid ${direction === value ? "var(--blue)" : "var(--border)"}`,
                  background:   direction === value ? "var(--blue-50)" : "var(--surface)",
                  cursor:       "pointer",
                  transition:   "border-color .15s, background .15s",
                }}
              >
                <span style={{ color: direction === value ? "var(--blue-700)" : "var(--text-3)" }}>
                  {icon}
                </span>
                <span style={{
                  fontSize:   13,
                  fontWeight: 600,
                  color:      direction === value ? "var(--blue-700)" : "var(--text)",
                }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
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
    </div>
  );
}
