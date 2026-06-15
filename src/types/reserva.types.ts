export type ReservaStatus = "Pendente" | "Confirmado" | "Cancelado" | "Concluido";

export const RESERVA_STATUS_CODE: Record<ReservaStatus, number> = {
  Pendente: 0,
  Confirmado: 1,
  Cancelado: 2,
  Concluido: 3,
};

export interface ReservaCliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  foto: string;
  dataCriacao: string;
}

export interface ReservaResponsavel {
  id: number;
  nome: string;
  foto: string;
  tipo: string;
  avaliacao: number;
  quantidadeAvaliacoes: number;
}

export interface ReservaServico {
  id: number;
  nome: string;
}

export interface ReservaInterface {
  id: number;
  dataInicio: string;
  dataFim: string;
  precoTotal: number;
  pago: boolean;
  status: ReservaStatus;
  tipoEvento: string;
  local: string;
  imagem: string | null;
  capacidade: number;
  cliente: ReservaCliente;
  responsaveis: ReservaResponsavel[];
  servicos: ReservaServico[];
}

export interface AtualizarStatusRequest {
  id: number;
  status: number;
}
