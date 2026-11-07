"use client";
import { useEffect, useState, useTransition } from "react";
import type { MetodoReembolso } from "@/types/admin.types";
import { registarReembolso } from "@/actions/admin.actions";
import { GlobalModal } from "@/components/global/GlobalModal";
import { GlobalButton } from "@/components/global/GlobalButton";
import { formatCurrencyAOA } from "@/lib/utils";

export const NOMES_METODO_REEMBOLSO: Record<MetodoReembolso, string> = {
  Transferencia: "Transferência bancária",
  Momenu: "Momenu",
  Numerario: "Numerário",
  Outro: "Outra",
};

interface RegistarReembolsoModalProps {
  aberto: boolean;
  onFechar: () => void;
  reservaId: number;
  porReembolsar: number;
  cliente: string;
  onFeito: (mensagem: string) => void;
}

const campo = { border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)" } as const;

/** Regista um reembolso já feito fora da plataforma. O back-end limita ao que falta reembolsar. */
export function RegistarReembolsoModal({ aberto, onFechar, reservaId, porReembolsar, cliente, onFeito }: RegistarReembolsoModalProps) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<MetodoReembolso>("Transferencia");
  const [referencia, setReferencia] = useState("");
  const [data, setData] = useState(hoje);
  const [nota, setNota] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, startGravar] = useTransition();

  useEffect(() => {
    if (!aberto) return;
    setValor(String(porReembolsar));
    setMetodo("Transferencia");
    setReferencia("");
    setData(new Date().toISOString().slice(0, 10));
    setNota("");
    setErro(null);
  }, [aberto, porReembolsar]);

  function confirmar() {
    const numero = Number(valor.replace(",", "."));
    if (!Number.isFinite(numero) || numero <= 0) return setErro("Indica um valor maior do que zero.");
    if (numero > porReembolsar) return setErro(`O máximo é ${formatCurrencyAOA(porReembolsar)} (o que falta reembolsar).`);
    if (metodo === "Outro" && !nota.trim()) return setErro("Com a forma \"Outra\", explica na nota como foi feito.");

    startGravar(async () => {
      const res = await registarReembolso(reservaId, {
        valor: numero,
        metodo,
        referencia: referencia.trim() || undefined,
        nota: nota.trim() || undefined,
        // Hoje: o back-end usa a hora atual. Outro dia: meio-dia, para não cair no dia anterior.
        reembolsadoEm: data && data !== hoje ? `${data}T12:00:00Z` : undefined,
      });
      if (!res.success) return setErro(res.error);
      onFeito(res.mensagem);
    });
  }

  return (
    <GlobalModal
      open={aberto}
      onOpenChange={(o) => !o && !aGravar && onFechar()}
      title={`Registar reembolso da reserva #${reservaId}`}
      description={`Regista um reembolso que já fizeste a ${cliente}. O dinheiro não sai pela plataforma; ${cliente} recebe uma notificação e um email com o valor.`}
      size="md"
      footer={
        <>
          <GlobalButton variant="secondary" onClick={onFechar} disabled={aGravar}>Voltar</GlobalButton>
          <GlobalButton variant="primary" onClick={confirmar} loading={aGravar}>Registar reembolso</GlobalButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reembolso-valor" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Valor (Kz)</label>
          <input id="reembolso-valor" inputMode="decimal" value={valor} onChange={(e) => { setValor(e.target.value); setErro(null); }} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ ...campo, fontVariantNumeric: "tabular-nums" }} />
          <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>Falta reembolsar {formatCurrencyAOA(porReembolsar)}.</p>
        </div>
        <div>
          <label htmlFor="reembolso-metodo" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Forma</label>
          <select id="reembolso-metodo" value={metodo} onChange={(e) => { setMetodo(e.target.value as MetodoReembolso); setErro(null); }} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={campo}>
            {(Object.keys(NOMES_METODO_REEMBOLSO) as MetodoReembolso[]).map((m) => <option key={m} value={m}>{NOMES_METODO_REEMBOLSO[m]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="reembolso-referencia" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Referência <span style={{ color: "var(--text-3)" }}>(opcional)</span></label>
          <input id="reembolso-referencia" value={referencia} maxLength={100} onChange={(e) => setReferencia(e.target.value)} placeholder="Nº da operação" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={campo} />
        </div>
        <div>
          <label htmlFor="reembolso-data" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>Data do reembolso</label>
          <input id="reembolso-data" type="date" value={data} max={hoje} onChange={(e) => setData(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={campo} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="reembolso-nota" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
            Nota {metodo === "Outro" ? <span style={{ color: "var(--danger)" }}>*</span> : <span style={{ color: "var(--text-3)" }}>(opcional)</span>}
          </label>
          <textarea id="reembolso-nota" value={nota} rows={2} maxLength={500} onChange={(e) => { setNota(e.target.value); setErro(null); }} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y" style={campo} />
        </div>
        {erro && <p className="sm:col-span-2 text-sm" role="alert" style={{ color: "var(--danger-fg)" }}>{erro}</p>}
      </div>
    </GlobalModal>
  );
}
