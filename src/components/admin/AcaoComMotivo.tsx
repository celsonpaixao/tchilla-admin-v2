"use client";
import { useEffect, useState, useTransition } from "react";
import { GlobalModal } from "@/components/global/GlobalModal";
import { GlobalButton } from "@/components/global/GlobalButton";
import { CampoMotivo } from "@/components/global/FiltrosUI";

/** O back-end recusa motivos com menos de 5 caracteres. */
export const MOTIVO_MIN = 5;

interface AcaoComMotivoProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao: string;
  /** Texto do botão que confirma (diz o que acontece: "Cancelar reserva"). */
  rotulo: string;
  perigo?: boolean;
  /** Quem lê o motivo. */
  ajuda: string;
  placeholder?: string;
  /** Palavra que é preciso escrever para confirmar (ações irreversíveis). */
  confirmarCom?: string;
  /** Se existir, a ação não pode avançar e isto explica porquê. */
  impedimento?: string | null;
  children?: React.ReactNode;
  /** Devolve a mensagem de erro do back-end, ou null quando correu bem. */
  onConfirmar: (motivo: string) => Promise<string | null>;
}

/** Confirmação de uma ação que exige motivo (cancelar, bloquear, ocultar, apagar). */
export function AcaoComMotivo({
  aberto, onFechar, titulo, descricao, rotulo, perigo, ajuda, placeholder, confirmarCom, impedimento, children, onConfirmar,
}: AcaoComMotivoProps) {
  const [motivo, setMotivo] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, startGravar] = useTransition();

  useEffect(() => {
    if (!aberto) return;
    setMotivo("");
    setConfirmacao("");
    setErro(null);
  }, [aberto]);

  const falta = confirmarCom && confirmacao.trim().toUpperCase() !== confirmarCom.toUpperCase();

  function confirmar() {
    const texto = motivo.trim();
    if (texto.length < MOTIVO_MIN) {
      setErro(`Escreve o motivo (pelo menos ${MOTIVO_MIN} caracteres).`);
      return;
    }
    startGravar(async () => {
      const resultado = await onConfirmar(texto);
      if (resultado) setErro(resultado);
    });
  }

  return (
    <GlobalModal
      open={aberto}
      onOpenChange={(o) => !o && !aGravar && onFechar()}
      title={titulo}
      description={descricao}
      size="md"
      footer={
        <>
          <GlobalButton variant="secondary" onClick={onFechar} disabled={aGravar}>Voltar</GlobalButton>
          <GlobalButton variant={perigo ? "danger" : "primary"} onClick={confirmar} loading={aGravar} disabled={!!impedimento || !!falta}>
            {rotulo}
          </GlobalButton>
        </>
      }
    >
      <div className="space-y-4">
        {children}
        {impedimento ? (
          <p className="text-sm rounded-lg px-3 py-2" role="alert" style={{ background: "var(--warning-bg)", color: "var(--warning-fg)", border: "1px solid var(--warning-bd)" }}>
            {impedimento}
          </p>
        ) : (
          <>
            <div>
              <CampoMotivo
                id="motivo-acao"
                valor={motivo}
                onChange={(v) => { setMotivo(v); if (erro) setErro(null); }}
                erro={erro}
                ajuda={ajuda}
                placeholder={placeholder}
              />
            </div>
            {confirmarCom && (
              <div>
                <label htmlFor="confirmar-acao" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                  Para confirmar, escreve <strong>{confirmarCom}</strong>
                </label>
                <input
                  id="confirmar-acao"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)" }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </GlobalModal>
  );
}
