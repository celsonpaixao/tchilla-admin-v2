"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNotificationStore } from "@/stores/notificationStore";
import { cn, formatRelativeTime, greetingByHour } from "@/lib/utils";
import type { UsuarioInterface } from "@/types/user.types";

interface TopbarProps {
  user: UsuarioInterface | null;
  title?: string;
}

const TIPO_ICON: Record<string, string> = {
  reserva_nova: "📅",
  reserva_nova_parceiro: "📅",
  reserva_confirmada: "✅",
  reserva_cancelada: "❌",
  reserva_concluida: "🎊",
  reserva_pago: "💰",
};

export function Topbar({ user, title }: TopbarProps) {
  const {
    notifications,
    unreadCount,
    hasMore,
    isLoadingMore,
    markAsRead,
    markAllAsRead,
    triggerLoadMore,
  } = useNotificationStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ── markAsRead: local + Firestore ── */
  async function handleMarkAsRead(id: string, alreadyRead: boolean) {
    if (alreadyRead) return;
    markAsRead(id);
    try {
      await updateDoc(doc(db, "notificacoes", id), { lida: true });
    } catch {}
  }

  /* ── markAllAsRead: local + Firestore (batch individual) ── */
  async function handleMarkAllAsRead() {
    const unread = notifications.filter((n) => !n.lida);
    markAllAsRead();
    for (const n of unread) {
      try {
        await updateDoc(doc(db, "notificacoes", n.id), { lida: true });
      } catch {}
    }
  }

  /* ── Scroll infinito: IntersectionObserver no sentinel ── */
  const handleLoadMore = useCallback(() => {
    triggerLoadMore();
  }, [triggerLoadMore]);

  useEffect(() => {
    if (!notifOpen || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { root: listRef.current, threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [notifOpen, handleLoadMore]);

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
      {/* Título */}
      <div className="flex-1 min-w-0 lg:ml-0 ml-10">
        {title ? (
          <h1 className="text-base font-semibold truncate" style={{ color: "var(--text)" }}>
            {title}
          </h1>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            {greetingByHour()},{" "}
            <span style={{ color: "var(--text)" }} className="font-medium">
              {user?.nome?.split(" ")[0] ?? "Supervisor"}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* ── Sino ── */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
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

          {/* ── Painel de notificações ── */}
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />

              <div
                className="absolute right-0 top-11 w-96 rounded-xl z-20 overflow-hidden flex flex-col"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-lg)",
                  maxHeight: "min(520px, calc(100vh - 80px))",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      Notificações
                    </span>
                    {unreadCount > 0 && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: "var(--pink)", color: "white" }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-1 text-xs cursor-pointer transition-colors"
                      style={{ color: "var(--blue)" }}
                      title="Marcar todas como lidas"
                    >
                      <CheckCheck size={13} />
                      Marcar todas
                    </button>
                  )}
                </div>

                {/* Lista com scroll infinito */}
                <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell size={28} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm" style={{ color: "var(--text-3)" }}>
                        Nenhuma notificação
                      </p>
                    </div>
                  ) : (
                    <>
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id, n.lida)}
                          className={cn(
                            "w-full text-left px-4 py-3 border-b transition-colors cursor-pointer flex gap-3",
                            !n.lida && "border-l-2"
                          )}
                          style={{
                            borderBottomColor: "var(--border)",
                            borderLeftColor: n.lida ? "transparent" : "var(--blue)",
                            background: n.lida ? "transparent" : "var(--blue-50)",
                          }}
                          onMouseEnter={(e) => {
                            if (n.lida) e.currentTarget.style.background = "var(--gray-50)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = n.lida ? "transparent" : "var(--blue-50)";
                          }}
                        >
                          {/* Ícone do tipo */}
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                            style={{ background: "var(--gray-100)" }}
                          >
                            {TIPO_ICON[n.tipo] ?? "🔔"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-semibold mb-0.5 truncate"
                              style={{ color: "var(--text)" }}
                            >
                              {n.titulo}
                            </p>
                            <p
                              className="text-xs leading-relaxed line-clamp-2"
                              style={{ color: "var(--text-2)" }}
                            >
                              {n.mensagem}
                            </p>
                            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                              {formatRelativeTime(n.criadoEm?.toDate?.()?.toISOString() ?? "")}
                            </p>
                          </div>

                          {!n.lida && (
                            <div
                              className="flex-shrink-0 w-2 h-2 rounded-full mt-1"
                              style={{ background: "var(--blue)" }}
                            />
                          )}
                        </button>
                      ))}

                      {/* Sentinel para IntersectionObserver */}
                      <div ref={sentinelRef} className="px-4 py-3 text-center">
                        {isLoadingMore ? (
                          <p className="text-xs" style={{ color: "var(--text-3)" }}>
                            A carregar…
                          </p>
                        ) : hasMore ? (
                          <p className="text-xs" style={{ color: "var(--text-3)" }}>
                            Role para ver mais
                          </p>
                        ) : notifications.length > 0 ? (
                          <p className="text-xs" style={{ color: "var(--text-3)" }}>
                            Sem mais notificações
                          </p>
                        ) : null}
                      </div>
                    </>
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
