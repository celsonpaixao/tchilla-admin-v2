/** Estados do pagamento no back-end (tabela `pagamento`). */
export type PagamentoStatus = "Pendente" | "Pago" | "Falhado" | "Rejeitado";

export type MetodoPagamento = "MCX" | "REFERENCIA" | "TRANSFERENCIA";

export type OrigemPagamento = "Reserva" | "Compra" | "Convite";

export interface ClientePagamento {
  id: number;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
}

/** GET /api/Payment/admin */
export interface PagamentoInterface {
  id: number;
  origem: OrigemPagamento | "-";
  reservaId?: number | null;
  compraId?: number | null;
  conviteId?: number | null;
  tipoReserva?: string | null;
  cliente?: ClientePagamento | null;
  metodoPagamento?: MetodoPagamento | string | null;
  fornecedor?: string | null;
  estado: PagamentoStatus | string;
  valor: number;
  taxaCliente?: number | null;
  comissaoPlataforma?: number | null;
  valorParceiro?: number | null;
  split: boolean;
  /** Comprovativo enviado pelo cliente (só transferências). */
  comprovativoUrl?: string | null;
  faturaUrl?: string | null;
  referencia?: string | null;
  entidade?: string | null;
  dataExpiracao?: string | null;
  criadoEm: string;
  atualizadoEm?: string | null;
  pagoEm?: string | null;
  /** Transferência pendente: pode ser validada ou rejeitada. */
  podeValidar: boolean;
}

export interface FiltroPagamentos {
  estado?: PagamentoStatus;
  metodo?: MetodoPagamento;
  origem?: OrigemPagamento;
  porValidar?: boolean;
  de?: string;
  ate?: string;
  pesquisa?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface Paginado<T> {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: T[];
}

export interface Total {
  quantidade: number;
  valor: number;
}

/** GET /api/Payment/admin/resumo */
export interface ResumoFinanceiro {
  de?: string | null;
  ate?: string | null;
  recebido: Total;
  pendente: Total;
  porValidar: Total;
  falhado: Total;
  rejeitado: Total;
  taxasCliente: number;
  comissaoPlataformaSplit: number;
  comissoesPendentes: Total;
  comissoesPagas: Total;
  recebidoPorMetodo: { metodo: string; quantidade: number; valor: number }[];
}

export type ComissaoStatus = "Pendente" | "Pago" | "Cancelada";

/** GET /api/Payment/admin/comissoes */
export interface ComissaoInterface {
  id: number;
  reservaId: number;
  tipoReserva?: string | null;
  estado: ComissaoStatus | string;
  valor: number;
  percentual: number;
  criadoEm: string;
  agenciaId: number;
  agencia?: string | null;
  comprovativoParceiro?: string | null;
  parceiroEnviouComprovativo: boolean;
  pagamentoId: number;
  pagamentoEstado?: string | null;
  pagamentoValor?: number | null;
}

export interface FiltroComissoes {
  estado?: ComissaoStatus;
  agenciaId?: number;
  porConfirmar?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export const METODO_LABELS: Record<string, string> = {
  MCX: "Multicaixa Express",
  REFERENCIA: "Referência",
  TRANSFERENCIA: "Transferência",
};
