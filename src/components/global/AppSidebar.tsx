"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  LayoutDashboard, CalendarCheck, Users, UserCheck,
  CreditCard, Settings, LogOut, Loader2, Menu, X,
  Tag, Megaphone, BarChart3, Ticket,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import type { UsuarioInterface } from "@/types/user.types";
import { useNotificationStore } from "@/stores/notificationStore";

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
      ],
    },
    {
      groupLabel: "Gestão",
      links: [
        { label: "Categorias",   href: ROUTES.GESTAO.CATEGORIAS,  icon: <Tag size={17} /> },
        { label: "Supervisores", href: ROUTES.GESTAO.SUPERVISORES, icon: <UserCheck size={17} /> },
        { label: "Campanhas",    href: ROUTES.GESTAO.CAMPANHAS,    icon: <Megaphone size={17} /> },
        { label: "Cupons",       href: ROUTES.GESTAO.CUPONS,       icon: <Ticket size={17} /> },
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
      ],
    },
    {
      groupLabel: "Sistema",
      links: [
        { label: "Definições", href: ROUTES.CONFIGURACOES, icon: <Settings size={17} /> },
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
}

function SidebarContent({ user, pathname, onLogout, isPending, unreadCount }: SidebarContentProps) {
  const navGroups = buildNav(unreadCount);

  return (
    <div style={{
      position: "sticky", top: 0, height: "100vh",
      background: "var(--navy)", color: "#cfe0ee",
      display: "flex", flexDirection: "column",
      padding: 0, overflow: "hidden",
    }}>

      {/* ── .side-brand ─────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 11,
        padding: "18px 18px 16px",
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
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "7px 12px",
                    borderRadius: "var(--r-sm)",
                    color: isActive ? "#fff" : "#bcd0e2",
                    fontSize: 13, fontWeight: 500,
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
        padding: "10px 10px 12px",
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
              color: "rgba(255,255,255,.35)", padding: 4,
              borderRadius: "var(--r-xs)", display: "grid", placeItems: "center",
              transition: "color .12s", flexShrink: 0,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.35)")}
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
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
  const [mobileOpen, setMobileOpen]  = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  function handleLogout() {
    startTransition(async () => {
      try {
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

      {/* Mobile toggle — display gerido pelo Tailwind (lg:hidden), sem display inline */}
      <button
        className="lg:hidden fixed flex items-center justify-center"
        style={{
          top: 14, left: 14, zIndex: 50,
          padding: 8, borderRadius: "var(--r-md)",
          background: "var(--navy)", color: "white",
          border: "none", cursor: "pointer",
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden"
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,.5)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden" style={{
            position: "fixed", left: 0, top: 0, bottom: 0,
            width: "var(--sidebar-width)", zIndex: 50,
          }}>
            <SidebarContent {...props} />
          </aside>
        </>
      )}
    </>
  );
}
