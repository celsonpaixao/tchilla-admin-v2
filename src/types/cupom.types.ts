export interface CupomData {
  id: number;
  nome: string;
  porcentagemDesconto: number;
  validoAte: string;
  ativo: boolean;
  criadoEm: string;
}

export interface CreateCupomRequest {
  nome: string;
  porcentagemDesconto: number;
  validoAte: string;
}

export interface UpdateCupomRequest {
  id: number;
  nome: string;
  porcentagemDesconto: number;
  validoAte: string;
  ativo: boolean;
}
