/** GET /api/Metricas/funil — jornada do cliente até reservar, por fluxo. */
export interface MetricasFunil {
  inicio: string;
  fim: string;
  fluxos: FluxoMetricas[];
  orcamento: OrcamentoMetricas;
}

/** planear, orcamento, avulsa, promocao ou colecao. */
export interface FluxoMetricas {
  fluxo: string;
  /** Tentativas distintas (a app gera uma jornada por tentativa). */
  jornadas: number;
  /** Jornadas que chegaram a cada passo, da mais vista para a menos. */
  passos: { passo: string; jornadas: number }[];
  reservas: number;
  confirmadas: number;
  pagas: number;
  canceladas: number;
  valorReservado: number;
  valorPago: number;
  ticketMedio: number;
  /** Reservas / jornadas, em %. Nulo sem jornadas. */
  conversao: number | null;
  /** Mediana, em minutos, do primeiro passo até à reserva. */
  minutosAteReservar: number | null;
}

export interface OrcamentoMetricas {
  criados: number;
  reservados: number;
  /** Abertos, com itens, sem mexer há 7 dias ou mais. */
  abandonados: number;
  itensAdicionados: number;
  itensRemovidos: number;
  itensPorOrcamentoReservado: number | null;
  maisRemovidos: AnuncioContagem[];
  maisAdicionados: AnuncioContagem[];
}

export interface AnuncioContagem {
  tipo: "servico" | "espaco";
  id: number;
  nome: string;
  vezes: number;
}
