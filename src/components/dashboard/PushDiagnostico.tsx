"use client";
import { useEffect, useState } from "react";
import { BellRing, Copy, RefreshCw, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { usePushStore, type EtapaPush } from "@/stores/pushStore";
import { ativarNotificacoes, notificacaoDeTeste, registarDispositivo, type UtilizadorPush } from "@/lib/push";
import { GlobalButton } from "@/components/global/GlobalButton";

const ESTADOS: Record<EtapaPush, { rotulo: string; cor: string; fundo: string }> = {
  "a-verificar": { rotulo: "A verificar…",   cor: "var(--neutral-fg)", fundo: "var(--neutral-bg)" },
  "a-registar":  { rotulo: "A registar…",    cor: "var(--info-fg)",    fundo: "var(--info-bg)" },
  registado:     { rotulo: "Ativas",         cor: "var(--success-fg)", fundo: "var(--success-bg)" },
  "por-ativar":  { rotulo: "Por ativar",     cor: "var(--warning-fg)", fundo: "var(--warning-bg)" },
  bloqueado:     { rotulo: "Bloqueadas",     cor: "var(--danger-fg)",  fundo: "var(--danger-bg)" },
  "sem-suporte": { rotulo: "Sem suporte",    cor: "var(--neutral-fg)", fundo: "var(--neutral-bg)" },
  erro:          { rotulo: "Erro no registo", cor: "var(--danger-fg)", fundo: "var(--danger-bg)" },
};

const encurtar = (v: string) => (v.length > 28 ? `${v.slice(0, 16)}…${v.slice(-8)}` : v);

function Linha({ rotulo, valor, copiar }: { rotulo: string; valor: React.ReactNode; copiar?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2" style={{ borderTop: "1px solid var(--border)" }}>
      <dt className="text-xs flex-shrink-0 pt-0.5" style={{ color: "var(--text-3)" }}>{rotulo}</dt>
      <dd className="text-sm text-right min-w-0 break-all flex items-center gap-1" style={{ color: "var(--text)" }}>
        {valor}
        {copiar && (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(copiar).then(() => toast.success(`${rotulo} copiado`))}
            aria-label={`Copiar ${rotulo.toLowerCase()}`}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ color: "var(--text-3)" }}
          >
            <Copy size={14} />
          </button>
        )}
      </dd>
    </div>
  );
}

/** Estado do push neste dispositivo: suporte, permissão, token e documento em fcm_tokens. */
export function PushDiagnostico({ user }: { user: UtilizadorPush }) {
  const s = usePushStore();
  const [ambiente, setAmbiente] = useState<{ permissao: string; instalada: boolean } | null>(null);
  const [aTrabalhar, setATrabalhar] = useState(false);

  useEffect(() => {
    setAmbiente({
      permissao: "Notification" in window ? Notification.permission : "indisponível",
      instalada:
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true,
    });
  }, [s.etapa]);

  const estado = ESTADOS[s.etapa];

  async function acao(fn: () => Promise<void>) {
    setATrabalhar(true);
    try { await fn(); } finally { setATrabalhar(false); }
  }

  return (
    <section
      className="rounded-xl p-5 space-y-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      aria-labelledby="push-titulo"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id="push-titulo" className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
          <BellRing size={15} /> Notificações neste dispositivo
        </h3>
        {/* Estado com palavra + cor + ponto (regra R4) */}
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
          style={{ background: estado.fundo, color: estado.cor }}
          aria-live="polite"
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
          {estado.rotulo}
        </span>
      </div>

      {s.detalhe && (
        <p className="text-sm" style={{ color: s.etapa === "erro" || s.etapa === "bloqueado" ? "var(--danger-fg)" : "var(--text-2)" }}>
          {s.detalhe}
        </p>
      )}

      <dl>
        <Linha rotulo="Permissão" valor={{ granted: "Concedida", denied: "Recusada", default: "Por decidir" }[ambiente?.permissao ?? ""] ?? ambiente?.permissao ?? "—"} />
        <Linha rotulo="App instalada" valor={ambiente ? (ambiente.instalada ? "Sim" : "Não (no browser)") : "—"} />
        <Linha rotulo="Projeto Firebase" valor={s.projeto ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "—"} />
        <Linha rotulo="Token FCM" valor={s.token ? <span className="font-mono text-xs">{encurtar(s.token)}</span> : "Não gerado"} copiar={s.token} />
        <Linha rotulo="Documento em fcm_tokens" valor={s.docId ? <span className="font-mono text-xs">{s.docId}</span> : "—"} copiar={s.docId} />
        <Linha
          rotulo="Último registo"
          valor={s.registadoEm ? formatDistanceToNow(s.registadoEm, { addSuffix: true, locale: ptBR }) : "—"}
        />
        {s.codigo && <Linha rotulo="Código do erro" valor={<span className="font-mono text-xs">{s.codigo}</span>} />}
      </dl>

      <div className="flex flex-wrap gap-2 pt-1">
        {s.etapa === "por-ativar" ? (
          <GlobalButton onClick={() => acao(() => ativarNotificacoes(user))} loading={aTrabalhar} leftIcon={<BellRing size={15} />}>
            Ativar notificações
          </GlobalButton>
        ) : (
          <GlobalButton
            variant={s.etapa === "erro" ? "primary" : "outline"}
            onClick={() => acao(() => registarDispositivo(user))}
            loading={aTrabalhar}
            disabled={s.etapa === "sem-suporte" || s.etapa === "bloqueado"}
            leftIcon={<RefreshCw size={15} />}
          >
            Registar de novo
          </GlobalButton>
        )}
        {ambiente?.permissao === "granted" && (
          <GlobalButton
            variant="outline"
            onClick={() => acao(() => notificacaoDeTeste().then(() => { toast.success("Notificação de teste enviada"); }).catch((e) => { toast.error(`Falhou: ${e?.message ?? e}`); }))}
            leftIcon={<Send size={15} />}
          >
            Testar notificação
          </GlobalButton>
        )}
      </div>
    </section>
  );
}
