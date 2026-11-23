/** Código de referência de quem divulga uma coleção (ex.: o casal do "Casamento E&C"). */
export interface CodigoReferenciaInterface {
  cupomId: number;
  codigo: string;
  beneficiario: string | null;
  colecaoId: number;
  colecao: string | null;
  percentual: number;
  desde: string | null;
  ate: string | null;
  /** null = valor do bónus por fechar. */
  bonus: number | null;
  ativo: boolean;
}

export type TipoComissaoReferencia = "comissao" | "estorno" | "bonus";
export type EstadoComissaoReferencia = "por_pagar" | "pago";

export interface LinhaComissaoReferencia {
  id: number;
  tipo: TipoComissaoReferencia;
  mes: string;
  reservaId: number | null;
  pedidoId: number | null;
  anuncio: string | null;
  base: number | null;
  percentual: number | null;
  /** Negativo num estorno. */
  valor: number;
  estado: EstadoComissaoReferencia;
  pagoEm: string | null;
  referenciaPagamento: string | null;
  nota: string | null;
}

export interface ComissoesDoMes {
  codigo: CodigoReferenciaInterface;
  mes: string;
  porPagar: number;
  pago: number;
  total: number;
  /** Por pagar até este mês, incluindo meses anteriores (e estornos). */
  porPagarAcumulado: number;
  linhas: LinhaComissaoReferencia[];
}
