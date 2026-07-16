import type { Timestamp } from "firebase/firestore";

export interface BudgetRequest {
  id: string;
  ambiente: string;
  convidados: number | null;
  criadoEm: Timestamp;
  data: Timestamp | null;
  extras: unknown[];
  fim: Timestamp | null;
  inicio: Timestamp | null;
  itensAdicionais: unknown[];
  pacoteNome: string | null;
  pacotePreco: number | null;
  propostaId: number;
  propostaNome: string;
  propostaType: string;
  quantidade: number | null;
  responsavelNome: string;
  responsavelTelefone: string;
  tipoEvento: string;
  userId: number;
  userNome: string;
  userTelefone: string;
}

export interface RankingItem {
  chave: string;
  label: string;
  telefone?: string;
  total: number;
  percentual: number;
}

export interface PeriodoPonto {
  label: string;
  total: number;
}
