"use client";
import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { usePushStore } from "@/stores/pushStore";
import { useUserStore } from "@/stores/userStore";
import { ativarNotificacoes } from "@/lib/push";

const ADIADO_KEY = "tchilla_admin_push_adiado_ate";
const ADIAR_DIAS = 3;

/**
 * Pede para ativar as notificações enquanto a permissão está por decidir. O pedido sai de um
 * toque no botão — é a única forma de o iPhone mostrar a pergunta. "Agora não" adia 3 dias;
 * em Configurações o botão está sempre disponível.
 */
export function PushAtivarAviso() {
  const etapa = usePushStore((s) => s.etapa);
  const user = useUserStore((s) => s.currentUser);
  const [adiado, setAdiado] = useState(true);
  const [aAtivar, setAAtivar] = useState(false);

  useEffect(() => {
    setAdiado(Number(localStorage.getItem(ADIADO_KEY) ?? 0) > Date.now());
  }, []);

  if (etapa !== "por-ativar" || adiado || !user) return null;

  async function ativar() {
    setAAtivar(true);
    await ativarNotificacoes(user!);
    setAAtivar(false);
  }

  function adiar() {
    localStorage.setItem(ADIADO_KEY, String(Date.now() + ADIAR_DIAS * 86_400_000));
    setAdiado(true);
  }

  return (
    <div
      role="region"
      aria-label="Ativar notificações"
      className="mb-4 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: "var(--info-bg)", border: "1px solid var(--info-bd)" }}
    >
      <BellRing size={18} style={{ color: "var(--info-fg)" }} className="flex-shrink-0" />
      <p className="flex-1 min-w-[180px] text-sm" style={{ color: "var(--info-fg)" }}>
        <strong>Ative as notificações</strong> para saber de novas reservas e pagamentos neste dispositivo.
      </p>
      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          onClick={ativar}
          disabled={aAtivar}
          className="min-h-10 px-4 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60"
          style={{ background: "var(--blue)", color: "var(--primary-fg)" }}
        >
          {aAtivar ? "A ativar…" : "Ativar notificações"}
        </button>
        <button
          type="button"
          onClick={adiar}
          aria-label="Agora não"
          title="Agora não"
          className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer"
          style={{ color: "var(--info-fg)" }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
