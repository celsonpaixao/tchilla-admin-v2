"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CalendarCheck, LayoutDashboard, Tag, Users, UserCheck,
  CreditCard, Settings, ChevronDown, LogOut, Loader2,
  Bell, Megaphone, ChevronRight, Menu, X, BarChart3
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import type { UsuarioInterface } from "@/types/user.types";
import { useNotificationStore } from "@/stores/notificationStore";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Reservas",
    icon: <CalendarCheck size={16} />,
    children: [
      { label: "Relatório", href: ROUTES.RESERVAS.RELATORIO, icon: <LayoutDashboard size={14} /> },
      { label: "Listagem", href: ROUTES.RESERVAS.LISTAGEM, icon: <CalendarCheck size={14} /> },
    ],
  },
  {
    label: "Gestão",
    icon: <Tag size={16} />,
    children: [
      { label: "Categorias", href: ROUTES.GESTAO.CATEGORIAS, icon: <Tag size={14} /> },
      { label: "Supervisores", href: ROUTES.GESTAO.SUPERVISORES, icon: <UserCheck size={14} /> },
      { label: "Campanhas", href: ROUTES.GESTAO.CAMPANHAS, icon: <Megaphone size={14} /> },
    ],
  },
  {
    label: "Usuários",
    icon: <Users size={16} />,
    children: [
      { label: "Clientes", href: ROUTES.USUARIOS.CLIENTES, icon: <Users size={14} /> },
      { label: "Parceiros", href: ROUTES.USUARIOS.PARCEIROS, icon: <UserCheck size={14} /> },
      { label: "Relatório", href: ROUTES.USUARIOS.RELATORIO, icon: <BarChart3 size={14} /> },
    ],
  },
  {
    label: "Finanças",
    icon: <CreditCard size={16} />,
    children: [
      { label: "Pagamentos", href: ROUTES.FINANCEIRO.PAGAMENTOS, icon: <CreditCard size={14} /> },
    ],
  },
];

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.children?.some((c) => c.href && pathname.startsWith(c.href));
  const [open, setOpen] = useState(isActive ?? false);

  if (!item.children) {
    return (
      <Link
        href={item.href!}
        className={cn("nav-item", pathname === item.href && "active")}
      >
        {item.icon}
        <span className="flex-1">{item.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn("nav-item w-full", isActive && "active")}
      >
        <span style={{ color: isActive ? "var(--blue)" : undefined }}>{item.icon}</span>
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          size={14}
          className="transition-transform duration-200"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.5,
          }}
        />
      </button>

      {open && (
        <div className="mt-0.5 ml-4 space-y-0.5 border-l" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href!}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ml-2",
                pathname.startsWith(child.href!)
                  ? "text-white"
                  : "opacity-60 hover:opacity-100 hover:text-white"
              )}
            >
              {child.icon}
              {child.label}
              {pathname.startsWith(child.href!) && (
                <ChevronRight size={12} className="ml-auto opacity-40" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

interface AppSidebarProps {
  user: UsuarioInterface | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full custom-scrollbar sidebar-scrollbar"
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)", minHeight: 60 }}
      >
        <Image
          src="/assets/vectores/tchilla-logotipo-branco.svg"
          alt="Tchilla Admin"
          width={120}
          height={32}
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 sidebar-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavGroup key={item.label} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* User footer */}
      <div
        className="p-3 border-t space-y-1"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Link
          href={ROUTES.CONFIGURACOES}
          className={cn("nav-item", pathname === ROUTES.CONFIGURACOES && "active")}
        >
          <Settings size={15} />
          <span className="flex-1">Configurações</span>
        </Link>

        {/* User info */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ background: "var(--blue)", color: "white" }}
          >
            {user ? getInitials(user.nome) : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user?.nome ?? "Usuário"}
            </p>
            <p className="text-2xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
              {user?.tipo ?? "Supervisor"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="cursor-pointer transition-colors rounded p-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
            aria-label="Sair"
            title="Sair"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          </button>
        </div>

        <p className="text-center text-2xs py-1" style={{ color: "rgba(255,255,255,0.2)" }}>
          © {new Date().getFullYear()} Tchilla
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30"
        style={{ width: "var(--sidebar-width)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg cursor-pointer"
        style={{ background: "var(--navy)", color: "white" }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 flex flex-col"
            style={{ width: "var(--sidebar-width)" }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Notification badge — invisible anchor */}
      {unreadCount > 0 && (
        <span className="sr-only">{unreadCount} notificações não lidas</span>
      )}
    </>
  );
}
