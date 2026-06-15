"use client";
import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { useNotificationStore } from "@/stores/notificationStore";
import { cn, formatRelativeTime, greetingByHour } from "@/lib/utils";
import type { UsuarioInterface } from "@/types/user.types";

interface TopbarProps {
  user: UsuarioInterface | null;
  title?: string;
}

export function Topbar({ user, title }: TopbarProps) {
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 px-5"
      style={{
        height: "var(--topbar-height)",
        background: "rgba(255,255,255,.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Título / breadcrumb */}
      <div className="flex-1 min-w-0 lg:ml-0 ml-10">
        {title ? (
          <h1 className="text-base font-semibold truncate" style={{ color: "var(--text)" }}>
            {title}
          </h1>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            {greetingByHour()}, <span style={{ color: "var(--text)" }} className="font-medium">{user?.nome?.split(" ")[0] ?? "Supervisor"}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Notificações */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer"
            style={{ color: "var(--text-2)" }}
            aria-label={`${unreadCount} notificações`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
                style={{ background: "var(--pink)", fontSize: "10px", fontWeight: 600 }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown de notificações */}
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotifOpen(false)}
              />
              <div
                className="absolute right-0 top-11 w-80 rounded-xl z-20 overflow-hidden"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    Notificações
                  </span>
                  {unreadCount > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: "var(--pink)", color: "white" }}
                    >
                      {unreadCount} novas
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bell size={24} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm" style={{ color: "var(--text-3)" }}>
                        Nenhuma notificação
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 15).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 border-b transition-colors cursor-pointer",
                          !n.data.lida && "border-l-2"
                        )}
                        style={{
                          borderBottomColor: "var(--border)",
                          borderLeftColor: n.data.lida ? "transparent" : "var(--blue)",
                          background: n.data.lida ? "transparent" : "var(--blue-50)",
                        }}
                      >
                        <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text)" }}>
                          {n.data.titulo}
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                          {n.data.mensagem}
                        </p>
                        <p className="text-2xs mt-1" style={{ color: "var(--text-3)" }}>
                          {formatRelativeTime(n.criadoEm?.toDate?.()?.toISOString() ?? "")}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
