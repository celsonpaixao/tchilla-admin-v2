export type PagamentoStatus = "Pendente" | "Confirmado" | "Cancelado" | "Concluido";

export interface PagamentoInterface {
  id: number;
  reservaId: number;
  url: string;
  estado: PagamentoStatus;
  criadoEm: string;
  atualizadoEm?: string | null;
  codigoEkwanza?: string | null;
  referencia?: string | null;
  dataExpiracao?: string | null;
  valor: number;
  metodoPagamento: string;
}
