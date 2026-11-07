/** Tipos das rotas de administração (fase 1): reservas, utilizadores, avaliações, catálogo, convites e plataforma. */

/** Resultado de uma ação de escrita: os dados novos e a mensagem do back-end (diz o que aconteceu a seguir). */
export type ResultadoEscrita<T> = { success: true; data: T; mensagem: string } | { success: false; error: string };

export interface PessoaAdmin {
  id: number;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
}

export interface ParceiroResumo {
  id: number;
  nome?: string | null;
  tipo?: string | null;
  usuarioId: number;
}

export interface QuantidadeValor {
  quantidade: number;
  valor: number;
}

export interface Contagem {
  chave: string;
  quantidade: number;
  valor: number;
}

export interface MoradaAdmin {
  id: number;
  nome?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  provincia?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/* ── Reservas ─────────────────────────────────────────────── */

export type TipoReservaAdmin = "espaco" | "servico" | "combo" | "misto" | "-";

export interface FiltroReservasAdmin {
  estado?: string;
  tipo?: "espaco" | "servico" | "combo";
  agenciaId?: number;
  clienteId?: number;
  pago?: boolean;
  de?: string;
  ate?: string;
  pesquisa?: string;
  ordem?: "recentes" | "data" | "valor";
  pageNumber?: number;
  pageSize?: number;
}

export interface ReservaAdminLinha {
  id: number;
  estado: string;
  tipoEvento?: string | null;
  dataInicio: string;
  dataFim: string;
  valorTotal: number;
  pago: boolean;
  criadoEm: string;
  atualizadoEm?: string | null;
  cliente?: PessoaAdmin | null;
  espaco?: { id: number; nome?: string | null; agenciaId: number } | null;
  quantidadeServicos: number;
  quantidadeCombos: number;
  tipo: TipoReservaAdmin;
  parceiros: ParceiroResumo[];
}

export interface ItemReservado {
  nome?: string | null;
  quantidade: number;
  precoUnitario: number;
}

export interface ReservaAdminDetalhe extends ReservaAdminLinha {
  morada?: MoradaAdmin | null;
  servicos: {
    servicoId: number;
    nome?: string | null;
    pacote?: string | null;
    quantidade?: number | null;
    precoUnitario?: number | null;
    precoTotal?: number | null;
    agenciaId?: number | null;
    extras: ItemReservado[];
  }[];
  combos: { comboId: number; nome?: string | null; preco: number; agenciaId: number }[];
  itensAdicionais: ItemReservado[];
  pagamentos: PagamentoResumo[];
  comissoes: { id: number; estado: string; valor: number; percentual: number; agenciaId: number; criadoEm: string }[];
  avaliacoes: { id: number; nota: number; mensagem?: string | null; criadoEm: string; apagada: boolean; oculta: boolean }[];
  /** Preenchido quando a equipa cancelou a reserva pelo painel. */
  cancelamento?: CancelamentoReserva | null;
  reembolsos: Reembolso[];
  reembolso: SaldoReembolso;
}

export interface CancelamentoReserva {
  motivo: string;
  estadoAnterior: string;
  estavaPaga: boolean;
  canceladoEm: string;
  canceladoPor?: PessoaAdmin | null;
}

export type MetodoReembolso = "Transferencia" | "Momenu" | "Numerario" | "Outro";

export interface Reembolso {
  id: number;
  reservaId: number;
  valor: number;
  metodo: MetodoReembolso;
  referencia?: string | null;
  nota?: string | null;
  reembolsadoEm: string;
  registadoEm: string;
  registadoPor?: PessoaAdmin | null;
}

export interface SaldoReembolso {
  pago: number;
  reembolsado: number;
  porReembolsar: number;
}

export interface RegistarReembolso {
  valor: number;
  metodo: MetodoReembolso;
  referencia?: string;
  nota?: string;
  /** ISO; por omissão, agora. */
  reembolsadoEm?: string;
}

export interface PagamentoResumo {
  id: number;
  estado: string;
  metodoPagamento?: string | null;
  valor: number;
  taxaCliente?: number | null;
  valorParceiro?: number | null;
  split: boolean;
  criadoEm: string;
  pagoEm?: string | null;
}

export interface ResumoReservasAdmin {
  de?: string | null;
  ate?: string | null;
  total: QuantidadeValor;
  porEstado: Contagem[];
  pagas: QuantidadeValor;
  porPagar: QuantidadeValor;
  proximosSeteDias: number;
  valorMedio: number;
}

/* ── Utilizadores ─────────────────────────────────────────── */

export type TipoUsuarioAdmin = "cliente" | "parceiro" | "equipa";

export interface FiltroUsuariosAdmin {
  pesquisa?: string;
  tipo?: TipoUsuarioAdmin;
  estado?: "ativos" | "bloqueados" | "apagados" | "todos";
  de?: string;
  ate?: string;
  ordem?: "recentes" | "nome" | "reservas";
  pageNumber?: number;
  pageSize?: number;
}

export interface UsuarioAdmin {
  id: number;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  foto?: string | null;
  tipo: TipoUsuarioAdmin;
  papel?: string | null;
  criadoEm: string;
  google: boolean;
  verificado: boolean;
  apagado: boolean;
  /** Bloqueada pela equipa: não entra nem usa a API. */
  bloqueado: boolean;
  /** Apagada e sem dados pessoais (irreversível). */
  anonimizado: boolean;
  agenciaId?: number | null;
  reservas: number;
}

export interface ResumoUsuariosAdmin {
  de: string;
  ate: string;
  total: number;
  novos: number;
  porTipo: Contagem[];
  comGoogle: number;
  verificados: number;
  apagados: number;
  bloqueados: number;
  comReservas: number;
}

export interface AtividadeUsuarioAdmin {
  usuario: UsuarioAdmin;
  reservasTotal: QuantidadeValor;
  reservasPagas: QuantidadeValor;
  ultimasReservas: ReservaAdminLinha[];
  ultimosPagamentos: PagamentoResumo[];
  ultimasAvaliacoes: {
    id: number;
    nota: number;
    mensagem?: string | null;
    alvo?: string | null;
    alvoId?: number | null;
    criadoEm: string;
    apagada: boolean;
    oculta: boolean;
  }[];
  avaliacoes: number;
  favoritos: number;
  comprasBilhetes: number;
  convites: number;
  ultimaReservaEm?: string | null;
  /** Bloqueio e anonimização; vazio se a equipa nunca mexeu na conta. */
  moderacao?: EstadoModeracaoConta | null;
  /** O que impede apagar a conta agora (vazio se já está apagada). */
  impedimentosApagar?: ImpedimentosApagarConta | null;
}

export interface EstadoModeracaoConta {
  bloqueada: boolean;
  motivo?: string | null;
  atualizadoEm?: string | null;
  atualizadoPor?: PessoaAdmin | null;
  anonimizada: boolean;
  anonimizadoEm?: string | null;
  anonimizadoPor?: PessoaAdmin | null;
  motivoApagar?: string | null;
}

export interface ImpedimentosApagarConta {
  reservasFuturasComoCliente: number;
  espacosPublicados: number;
  servicosAtivos: number;
  combosAtivos: number;
  eventosFuturos: number;
  reservasFuturasNosAnuncios: number;
  nenhum: boolean;
}

/* ── Avaliações ───────────────────────────────────────────── */

export type AlvoAvaliacao = "espaco" | "servico" | "combo" | "evento";

export interface FiltroAvaliacoesAdmin {
  notaMin?: number;
  notaMax?: number;
  alvo?: AlvoAvaliacao;
  agenciaId?: number;
  usuarioId?: number;
  incluirApagadas?: boolean;
  /** true: só as ocultas pela equipa; false: só as que a app mostra. */
  ocultas?: boolean;
  pesquisa?: string;
  de?: string;
  ate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AvaliacaoAdmin {
  id: number;
  nota: number;
  mensagem?: string | null;
  criadoEm: string;
  atualizadoEm?: string | null;
  apagadaEm?: string | null;
  /** Oculta pela equipa: não aparece na app nem conta para as médias. */
  ocultaEm?: string | null;
  ocultaMotivo?: string | null;
  ocultaPor?: PessoaAdmin | null;
  cliente?: PessoaAdmin | null;
  alvo?: AlvoAvaliacao | null;
  alvoId?: number | null;
  alvoNome?: string | null;
  parceiro?: ParceiroResumo | null;
  reservaId?: number | null;
}

export interface ResumoAvaliacoesAdmin {
  total: number;
  media: number;
  porNota: Contagem[];
  porAlvo: Contagem[];
  negativas: number;
  apagadas: number;
  ocultas: number;
  pioresAnuncios: { alvo: AlvoAvaliacao; alvoId: number; nome?: string | null; avaliacoes: number; media: number }[];
}

/* ── Catálogo ─────────────────────────────────────────────── */

export interface FiltroCatalogoAdmin {
  pesquisa?: string;
  agenciaId?: number;
  subCategoriaId?: number;
  estado?: string;
  incluirApagados?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface ServicoAdmin {
  id: number;
  nome?: string | null;
  preco: number;
  tipoPreco?: string | null;
  subCategoriaId: number;
  subCategoria?: string | null;
  parceiro?: ParceiroResumo | null;
  prestador?: PessoaAdmin | null;
  criadoEm: string;
  capa?: string | null;
  pacotes: number;
  reservas: number;
  avaliacoes: number;
  media?: number | null;
  apagado: boolean;
}

export interface ComboAdmin {
  id: number;
  nome?: string | null;
  preco: number;
  tipoPreco?: string | null;
  estado?: string | null;
  espacoId?: number | null;
  espaco?: string | null;
  parceiro?: ParceiroResumo | null;
  criadoEm: string;
  servicos: number;
  reservas: number;
  apagado: boolean;
}

export interface FiltroEventosAdmin {
  pesquisa?: string;
  categoriaId?: number;
  agenciaId?: number;
  quando?: "futuros" | "passados";
  de?: string;
  ate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface EventoAdmin {
  id: number;
  nome?: string | null;
  banner?: string | null;
  dataInicio: string;
  dataFim: string;
  categoriaId: number;
  categoria?: string | null;
  faixaEtaria?: string | null;
  agencia?: ParceiroResumo | null;
  organizador?: PessoaAdmin | null;
  tiposBilhete: number;
  bilhetesVendidos: number;
  receita: number;
}

export interface EventoAdminDetalhe extends EventoAdmin {
  descricao?: string | null;
  reservaId?: number | null;
  morada?: MoradaAdmin | null;
  bilhetes: { id: number; nome?: string | null; data: string; preco: number; vendidos: number; receita: number }[];
  compras: number;
  comprasPendentes: number;
  avaliacoes: number;
  media?: number | null;
}

export interface FiltroComprasBilhetes {
  estado?: string;
  eventoId?: number;
  clienteId?: number;
  pesquisa?: string;
  de?: string;
  ate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CompraBilhetesAdmin {
  id: number;
  data: string;
  cliente?: PessoaAdmin | null;
  totalPago: number;
  estado?: string | null;
  pagamentoId?: number | null;
  pagamentoEstado?: string | null;
  itens: { ticketId: number; bilhete?: string | null; eventoId: number; evento?: string | null; quantidade: number; preco: number }[];
  ingressos: number;
}

export interface AnunciosParceiro {
  parceiro: ParceiroResumo;
  espacos: {
    id: number;
    nome?: string | null;
    estado: string;
    suspenso: boolean;
    precoHora: number;
    capacidade: number;
    criadoEm: string;
    capa?: string | null;
    reservas: number;
  }[];
  servicos: ServicoAdmin[];
  combos: ComboAdmin[];
  eventos: EventoAdmin[];
}

/* ── Financeiro e plataforma ──────────────────────────────── */

export interface ParceiroFinanceiro {
  parceiro: ParceiroResumo;
  reservas: number;
  reservasPagas: number;
  valorReservasPagas: number;
  recebidoSplit: number;
  comissaoSplit: number;
  comissoesPendentes: QuantidadeValor;
  comissoesPagas: QuantidadeValor;
}

export interface FiltroConvitesAdmin {
  pesquisa?: string;
  escalao?: string;
  quando?: "futuros" | "passados";
  de?: string;
  ate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ConviteAdmin {
  id: number;
  token?: string | null;
  nomeEvento?: string | null;
  dataEvento: string;
  local?: string | null;
  escalao?: string | null;
  tema?: string | null;
  imagemUrl?: string | null;
  visualizacoes: number;
  criadoEm: string;
  dono?: PessoaAdmin | null;
  eventoId?: number | null;
  convidados: number;
  confirmados: number;
  pessoasConfirmadas: number;
  responderam: number;
  pagamento?: string | null;
}

export interface ConfiguracoesPlataforma {
  taxaClientePercent: number;
  comissaoParceiroPercent: number;
  taxaProcessamentoPercent: number;
  comissaoTransferenciaPercent: number;
  minimoPorParteSplit: number;
  transferenciaAtiva: boolean;
  momenuAmbienteQa: boolean;
  toleranciaWebhookSegundos: number;
  /** painel (um Admin alterou alguma taxa) ou appsettings. */
  origem: "painel" | "appsettings";
  atualizadoEm?: string | null;
  atualizadoPor?: PessoaAdmin | null;
  ambiente: string;
  limites: LimiteTaxa[];
  historico: AlteracaoTaxa[];
}

export type ChaveTaxa = "TaxaClientePercent" | "ComissaoParceiroPercent" | "TaxaProcessamentoPercent" | "ComissaoTransferenciaPercent";

export interface LimiteTaxa {
  chave: ChaveTaxa;
  nome: string;
  min: number;
  max: number;
  inteiro: boolean;
}

export interface AlteracaoTaxa {
  id: number;
  chave: ChaveTaxa;
  valorAnterior: number;
  valorNovo: number;
  nota: string;
  alteradoEm: string;
  alteradoPor?: PessoaAdmin | null;
}

export interface AlterarTaxas {
  taxaClientePercent?: number;
  comissaoParceiroPercent?: number;
  taxaProcessamentoPercent?: number;
  comissaoTransferenciaPercent?: number;
  nota: string;
}

/* ── Auditoria ────────────────────────────────────────────── */

export interface FiltroAuditoriaAdmin {
  usuarioId?: number;
  recurso?: string;
  resultado?: "sucesso" | "erro";
  alvoId?: number;
  de?: string;
  ate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AuditoriaAdmin {
  id: number;
  membro?: PessoaAdmin | null;
  papel?: string | null;
  metodo: string;
  caminho: string;
  recurso: string;
  acao: string;
  descricao?: string | null;
  /** IDs e estados envolvidos (ex.: { reservaId: "36" }). */
  alvo: Record<string, string>;
  estadoHttp: number;
  sucesso: boolean;
  duracaoMs?: number | null;
  criadoEm: string;
}
