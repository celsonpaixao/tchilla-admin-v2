"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, CreditCard, Users, Menu } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useNotificationStore } from "@/stores/notificationStore";
import { useUiStore } from "@/stores/uiStore";

/** Destinos de uso diário; o resto da navegação fica no menu. */
const TABS = [
  { label: "Início",     href: ROUTES.RESERVAS.RELATORIO,    icon: LayoutDashboard },
  { label: "Reservas",   href: ROUTES.RESERVAS.LISTAGEM,     icon: CalendarCheck, contador: true },
  { label: "Clientes",   href: ROUTES.USUARIOS.CLIENTES,     icon: Users },
  { label: "Pagamentos", href: ROUTES.FINANCEIRO.PAGAMENTOS, icon: CreditCard },
] as const;

/**
 * Barra de navegação inferior para telemóvel e tablet (< lg). No desktop a sidebar
 * ocupa este papel. Respeita a safe area do iPhone quando instalado como PWA.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const menuAberto = useUiStore((s) => s.menuAberto);
  const abrirMenu = useUiStore((s) => s.abrirMenu);

  return (
    <nav
      aria-label="Navegação principal"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -4px 16px rgba(14,42,66,.06)",
        paddingBottom: "var(--safe-bottom)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
      }}
    >
      <ul className="grid grid-cols-5 mx-auto" style={{ height: "var(--bottomnav-h)", maxWidth: 640 }}>
        {TABS.map(({ label, href, icon: Icon, ...tab }) => {
          const ativo = pathname.startsWith(href);
          const n = "contador" in tab && unreadCount > 0 ? unreadCount : 0;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className="h-full flex flex-col items-center justify-center gap-1"
                style={{ color: ativo ? "var(--blue-700)" : "var(--text-3)" }}
              >
                <span
                  className="relative flex items-center justify-center rounded-full transition-colors"
                  style={{ width: 52, height: 28, background: ativo ? "var(--blue-50)" : "transparent" }}
                >
                  <Icon size={20} strokeWidth={ativo ? 2.25 : 1.75} />
                  {n > 0 && (
                    <span
                      className="absolute flex items-center justify-center rounded-full"
                      style={{
                        top: -2, right: 6, minWidth: 16, height: 16, padding: "0 4px",
                        background: "var(--pink)", color: "#fff", fontSize: 10, fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {n > 9 ? "9+" : n}
                      <span className="sr-only"> por ler</span>
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 11, fontWeight: ativo ? 700 : 500, lineHeight: 1 }}>{label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={abrirMenu}
            aria-expanded={menuAberto}
            aria-label="Abrir menu com todas as secções"
            className="w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer"
            style={{ color: menuAberto ? "var(--blue-700)" : "var(--text-3)" }}
          >
            <span className="flex items-center justify-center" style={{ width: 52, height: 28 }}>
              <Menu size={20} strokeWidth={1.75} />
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}>Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
