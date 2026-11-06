export interface AgenciaEndereco {
  nome: string;
  complemento: string;
  bairro: string;
  numero: string;
  rua: string;
  cidade: string;
  pais: string;
  provincia: string;
  cep: string;
  latitude: number;
  longitude: number;
}

export interface AgenciaUsuario {
  id: number;
  nome: string;
  email: string;
  foto?: string;
  telefone: string;
  dataCriacao: string;
  tipo: string;
  verificado: boolean;
}

export interface AgenciaData {
  id: number;
  nif: string | null;
  descricao: string | null;
  nomeComercial: string | null;
  tipo: string;
  aprovado: boolean;
  usuario: AgenciaUsuario;
  endereco?: AgenciaEndereco | null;
}

/* ── Aprovação de parceiros (GET/PUT /api/Agencia/admin…) ──── */

export type EstadoParceiro = "Pendente" | "Aprovado" | "Rejeitado" | "Suspenso";

export interface ParceiroAdmin {
  id: number;
  nomeComercial?: string | null;
  tipo?: string | null;
  nif?: string | null;
  descricao?: string | null;
  criadoEm: string;
  responsavel: {
    id: number;
    nome?: string | null;
    email?: string | null;
    telefone?: string | null;
    foto?: string | null;
    verificado: boolean;
  };
  estado: EstadoParceiro;
  motivo?: string | null;
  estadoAtualizadoEm?: string | null;
  estadoAtualizadoPor?: string | null;
  anuncios: { espacos: number; servicos: number; combos: number; total: number };
  perfil: {
    nif: boolean;
    descricao: boolean;
    iban: boolean;
    endereco: boolean;
    foto: boolean;
    contaVerificada: boolean;
    preenchidos: number;
    total: number;
  };
}

export interface AnuncioResumo {
  id: number;
  nome?: string | null;
  estado?: string | null;
  criadoEm?: string | null;
}

export interface ParceiroDetalhe extends ParceiroAdmin {
  endereco?: string | null;
  contasBancarias: { titular?: string | null; banco?: string | null; iban?: string | null }[];
  espacos: AnuncioResumo[];
  servicos: AnuncioResumo[];
  combos: AnuncioResumo[];
}

export interface ResumoParceiros {
  pendentes: number;
  aprovados: number;
  rejeitados: number;
  suspensos: number;
  total: number;
}

export interface FiltroParceiros {
  estado?: EstadoParceiro;
  pesquisa?: string;
  pageNumber?: number;
  pageSize?: number;
}
