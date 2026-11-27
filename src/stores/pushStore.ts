"use client";
import { create } from "zustand";

/** Em que ponto está o registo de push deste dispositivo — mostrado em Configurações. */
export type EtapaPush =
  | "a-verificar"
  | "sem-suporte"      // browser/iOS sem Web Push (ou PWA não instalada no iPhone)
  | "por-ativar"       // permissão ainda não pedida: precisa de um toque do utilizador
  | "bloqueado"        // o utilizador recusou: só nas definições do sistema/browser
  | "a-registar"
  | "registado"
  | "erro";

interface PushStore {
  etapa: EtapaPush;
  /** Explicação para o utilizador (porquê / o que fazer). */
  detalhe: string | null;
  /** Código técnico do erro, para diagnóstico. */
  codigo: string | null;
  token: string | null;
  docId: string | null;
  /** Projeto Firebase onde o token foi guardado. */
  projeto: string | null;
  registadoEm: number | null;
  atualizar: (parcial: Partial<Omit<PushStore, "atualizar">>) => void;
}

export const usePushStore = create<PushStore>((set) => ({
  etapa: "a-verificar",
  detalhe: null,
  codigo: null,
  token: null,
  docId: null,
  projeto: null,
  registadoEm: null,
  atualizar: (parcial) => set(parcial),
}));
