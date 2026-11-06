/** espaco.status no back-end (EspacoStatus). */
export type EspacoStatus = "Rascunho" | "EmRevisao" | "Publicado" | "Suspenso" | "Inativo";

/** GET /api/Local/admin */
export interface EspacoAdmin {
  id: number;
  nome?: string | null;
  status: EspacoStatus | string;
  statusCodigo: number;
  agenciaId: number;
  agencia?: string | null;
  cidade?: string | null;
  provincia?: string | null;
  precoBase: number;
  tipoPreco?: string | null;
  capacidade: number;
  capaUrl?: string | null;
  criadoEm: string;
  atualizadoEm?: string | null;
  /** Reservas ainda por acontecer (não canceladas) — mantêm-se se o espaço for suspenso. */
  reservasFuturas: number;
  reservasTotal: number;
  suspensaoEquipa?: {
    ativa: boolean;
    motivo?: string | null;
    atualizadoEm: string;
    atualizadoPor?: string | null;
  } | null;
}

export interface ResumoEspacos {
  rascunho: number;
  emRevisao: number;
  publicado: number;
  suspenso: number;
  inativo: number;
  suspensosPelaEquipa: number;
  total: number;
}

export interface FiltroEspacos {
  status?: EspacoStatus;
  suspensosPelaEquipa?: boolean;
  agenciaId?: number;
  pesquisa?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const TIPO_PRECO_LABELS: Record<string, string> = {
  PorHora: "/hora",
  PorDia: "/dia",
  Fixo: "",
  PorPessoa: "/pessoa",
  PorMetroQuadrado: "/m²",
};
