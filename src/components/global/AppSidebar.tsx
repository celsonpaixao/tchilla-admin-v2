"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, CalendarCheck, Users, UserCheck,
  CreditCard, Settings, LogOut, Loader2, X,
  Tag, Megaphone, BarChart3, Percent,
  Receipt, Coins, Building2, History, Package, Star, MailOpen, Handshake, Ticket, ScrollText, Images, LayoutGrid, Sparkles, Filter,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import type { UsuarioInterface } from "@/types/user.types";
import { useNotificationStore } from "@/stores/notificationStore";
import { useUiStore } from "@/stores/uiStore";
import { desativarTokenDoDispositivo } from "@/lib/fcm-tokens";

/* ── Nav config ────────────────────────────────────────────── */
interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  count?: number | null;
}
interface NavGroup {
  groupLabel: string;
  links: NavLink[];
}

function buildNav(unreadCount: number): NavGroup[] {
  return [
    {
      groupLabel: "Operação",
      links: [
        { label: "Relatório",  href: ROUTES.RESERVAS.RELATORIO, icon: <LayoutDashboard size={17} /> },
        { label: "Reservas",   href: ROUTES.RESERVAS.LISTAGEM,  icon: <CalendarCheck size={17} />, count: unreadCount || null },
        { label: "Histórico",  href: ROUTES.RESERVAS.HISTORICO, icon: <History size={17} /> },
      ],
    },
    {
      groupLabel: "Gestão",
      links: [
        { label: "Categorias",   href: ROUTES.GESTAO.CATEGORIAS,  icon: <Tag size={17} /> },
        { label: "Supervisores", href: ROUTES.GESTAO.SUPERVISORES, icon: <UserCheck size={17} /> },
        { label: "Campanhas",    href: ROUTES.GESTAO.CAMPANHAS,    icon: <Megaphone size={17} /> },
        { label: "Promoções",    href: ROUTES.GESTAO.PROMOCOES,    icon: <Percent size={17} /> },
        { label: "Espaços",      href: ROUTES.GESTAO.ESPACOS,      icon: <Building2 size={17} /> },
        { label: "Catálogo",     href: ROUTES.GESTAO.CATALOGO,     icon: <Package size={17} /> },
        { label: "Avaliações",   href: ROUTES.GESTAO.AVALIACOES,   icon: <Star size={17} /> },
        { label: "Publicações",  href: ROUTES.GESTAO.PUBLICACOES,  icon: <Images size={17} /> },
        { label: "Coleções",     href: ROUTES.GESTAO.COLECOES,     icon: <LayoutGrid size={17} /> },
        { label: "Convites",     href: ROUTES.GESTAO.CONVITES,     icon: <MailOpen size={17} /> },
      ],
    },
    {
      groupLabel: "Usuários",
      links: [
        { label: "Clientes",  href: ROUTES.USUARIOS.CLIENTES,  icon: <Users size={17} /> },
        { label: "Parceiros", href: ROUTES.USUARIOS.PARCEIROS, icon: <UserCheck size={17} /> },
        { label: "Relatório", href: ROUTES.USUARIOS.RELATORIO, icon: <BarChart3 size={17} /> },
      ],
    },
    {
      groupLabel: "Análise",
      links: [
        { label: "Pagamentos", href: ROUTES.FINANCEIRO.PAGAMENTOS, icon: <CreditCard size={17} /> },
        { label: "Comissões",  href: ROUTES.FINANCEIRO.COMISSOES,  icon: <Coins size={17} /> },
        { label: "Por parceiro", href: ROUTES.FINANCEIRO.POR_PARCEIRO, icon: <Handshake size={17} /> },
        { label: "Códigos de referência", href: ROUTES.FINANCEIRO.CODIGOS_REFERENCIA, icon: <Ticket size={17} /> },
        { label: "Orçamentos", href: ROUTES.ANALISE.ORCAMENTOS,    icon: <Receipt size={17} /> },
        { label: "Camada social", href: ROUTES.ANALISE.SOCIAL, icon: <Sparkles size={17} /> },
        { label: "Funil de reservas", href: ROUTES.ANALISE.FUNIL, icon: <Filter size={17} /> },
      ],
    },
    {
      groupLabel: "Sistema",
      links: [
        { label: "Definições", href: ROUTES.CONFIGURACOES, icon: <Settings size={17} /> },
        { label: "Auditoria",  href: ROUTES.AUDITORIA,     icon: <ScrollText size={17} /> },
      ],
    },
  ];
}

/* ── Sidebar content ────────────────────────────────────────── */
interface SidebarContentProps {
  user: UsuarioInterface | null;
  pathname: string;
  onLogout: () => void;
  isPending: boolean;
  unreadCount: number;
  /** Só no menu mobile/tablet: fecha o painel (e ativa o layout tátil). */
  onClose?: () => void;
}

function SidebarContent({ user, pathname, onLogout, isPending, unreadCount, onClose }: SidebarContentProps) {
  const navGroups = buildNav(unreadCount);
  const mobile = !!onClose;

  return (
    <div style={{
      position: "sticky", top: 0, height: mobile ? "100%" : "100vh",
      background: "var(--navy)", color: "#cfe0ee",
      display: "flex", flexDirection: "column",
      padding: 0, overflow: "hidden",
    }}>

      {/* ── .side-brand ─────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 11,
        padding: mobile ? "calc(14px + var(--safe-top)) 12px 14px 18px" : "18px 18px 16px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        flexShrink: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/tchilla-simbolo-branco-lacorosa.png"
          alt="Tchilla"
          style={{ height: 30, width: "auto", objectFit: "contain", flexShrink: 0 }}
        />
        {/* .nm — Tchilla<small>Admin</small> */}
        <div style={{
          fontFamily: "var(--display)",
          fontWeight: 700,
          fontSize: 16,
          color: "#fff",
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}>
          Tchilla
          <small style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontWeight: 400,
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--pink)",
            textTransform: "uppercase",
            marginTop: 1,
          }}>
            Admin
          </small>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="ml-auto flex items-center justify-center rounded-lg cursor-pointer"
            style={{ width: 40, height: 40, color: "#bcd0e2", background: "rgba(255,255,255,.06)", border: "none" }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── .side-scroll ────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "10px 10px 24px",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,.12) transparent",
      }}
        className="side-scroll-custom"
      >
        {navGroups.map((group, gi) => (
          <div key={group.groupLabel} style={{ marginTop: gi === 0 ? 4 : 14 }}>
            {/* .nav-label */}
            <div style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#6f8aa3",
              padding: "6px 12px",
            }}>
              {group.groupLabel}
            </div>

            {/* .nav-link(s) */}
            {group.links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    // no menu tátil cada item tem ≥ 40px de altura
                    padding: mobile ? "11px 12px" : "7px 12px",
                    fontSize: mobile ? 14 : 13,
                    borderRadius: "var(--r-sm)",
                    color: isActive ? "#fff" : "#bcd0e2",
                    fontWeight: 500,
                    cursor: "pointer",
                    position: "relative",
                    transition: "background .12s, color .12s",
                    background: isActive ? "rgba(20,170,233,.16)" : "transparent",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#bcd0e2";
                    }
                  }}
                >
                  {/* barra rosa esquerda (::before) */}
                  {isActive && (
                    <span aria-hidden style={{
                      position: "absolute", left: 0, top: 6, bottom: 6,
                      width: 3, borderRadius: 99, background: "var(--pink)",
                    }} />
                  )}

                  {/* ícone 17×17 opacity .85 */}
                  <span style={{
                    width: 17, height: 17, display: "grid", placeItems: "center",
                    flexShrink: 0, opacity: isActive ? 1 : 0.85,
                    color: isActive ? "var(--blue)" : "inherit",
                  }}>
                    {link.icon}
                  </span>

                  <span style={{ flex: 1 }}>{link.label}</span>

                  {/* .count badge */}
                  {link.count != null && link.count > 0 && (
                    <span style={{
                      marginLeft: "auto",
                      fontFamily: "var(--mono)", fontSize: 10.5,
                      background: isActive ? "var(--pink)" : "rgba(255,255,255,.12)",
                      color: isActive ? "#fff" : "inherit",
                      padding: "1px 7px", borderRadius: 99,
                    }}>
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* ── Status card — "Sistema operacional" ─────────── */}
        <div style={{
          marginTop: 18, padding: 11, borderRadius: 10,
          background: "rgba(255,255,255,.05)",
          border: "1px solid rgba(255,255,255,.08)",
        }}>
          <div style={{ fontSize: 11, color: "#9db6cb", lineHeight: 1.45 }}>
            Sistema operacional
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            marginTop: 6, fontSize: 12, color: "#fff", fontWeight: 600,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#30BE6D",
              boxShadow: "0 0 0 3px rgba(48,190,109,.25)",
              flexShrink: 0,
            }} />
            Todos os serviços ativos
          </div>
        </div>
      </div>

      {/* ── Rodapé — usuário ────────────────────────────────── */}
      <div style={{
        padding: mobile ? "10px 10px calc(12px + var(--safe-bottom))" : "10px 10px 12px",
        borderTop: "1px solid rgba(255,255,255,.08)",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 10px", borderRadius: "var(--r-md)",
          background: "rgba(255,255,255,.05)",
        }}>
          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "var(--blue)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {user ? getInitials(user.nome) : "?"}
          </div>

          {/* Nome e tipo */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.nome ?? "Usuário"}
            </p>
            <p style={{
              fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 1,
              fontFamily: "var(--mono)", letterSpacing: "0.08em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.tipo ?? "Supervisor"}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            disabled={isPending}
            title="Sair" aria-label="Sair"
            style={{
              cursor: "pointer", background: "transparent", border: "none",
              color: mobile ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.35)",
              padding: mobile ? 0 : 4, width: mobile ? 40 : undefined, height: mobile ? 40 : undefined,
              borderRadius: "var(--r-xs)", display: "grid", placeItems: "center",
              transition: "color .12s", flexShrink: 0,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.35)")}
          >
            {isPending ? <Loader2 size={mobile ? 18 : 14} className="animate-spin" /> : <LogOut size={mobile ? 18 : 14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── AppSidebar principal ───────────────────────────────────── */
export function AppSidebar({ user }: { user: UsuarioInterface | null }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const [isPending, startTransition] = useTransition();
  const mobileOpen  = useUiStore((s) => s.menuAberto);
  const fecharMenu  = useUiStore((s) => s.fecharMenu);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // Fecha ao navegar (inclui o botão "voltar" do Android)
  useEffect(() => { fecharMenu(); }, [pathname, fecharMenu]);

  // Escape fecha; a página por trás não rola enquanto o menu está aberto
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") fecharMenu(); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, fecharMenu]);

  function handleLogout() {
    startTransition(async () => {
      try {
        if (user) await desativarTokenDoDispositivo(user.id);
        await fetch("/api/auth/logout", { method: "POST" });
        toast.success("Até logo!");
        router.push(ROUTES.LOGIN);
        router.refresh();
      } catch {
        toast.error("Erro ao sair. Tente novamente.");
      }
    });
  }

  const props = { user, pathname, onLogout: handleLogout, isPending, unreadCount };

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block" style={{
        position: "fixed", left: 0, top: 0, bottom: 0,
        width: "var(--sidebar-width)", zIndex: 30,
      }}>
        <SidebarContent {...props} />
      </aside>

      {/* Telemóvel/tablet — menu lateral aberto pela Topbar ou pela barra inferior */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="menu-overlay"
              className="lg:hidden"
              style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(14,42,66,.45)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.16 } }}
              onClick={fecharMenu}
            />
            <motion.aside
              key="menu-painel"
              className="lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              style={{
                position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 61,
                width: "min(300px, 86vw)",
                boxShadow: "8px 0 32px rgba(14,42,66,.25)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ x: "-100%", transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            >
              <SidebarContent {...props} onClose={fecharMenu} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
