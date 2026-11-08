export interface PromocaoAlvo {
  tipo: "espaco" | "servico";
  id: number;
  nome: string;
  descricao?: string | null;
  imagem?: string | null;
  preco: number;
  tipoPreco?: string | null;
  contratavel: boolean;
}

export interface PromocaoServicoElegivel {
  id: number;
  nome: string;
  descricao?: string | null;
  imagem?: string | null;
  preco: number;
  tipoPreco?: string | null;
  subCategoria?: string | null;
  contratavel: boolean;
  /** O cliente tem de levar este serviço; os outros da lista são sugestões. */
  obrigatorio?: boolean;
}

export interface PromocaoResumo {
  id: number;
  titulo: string;
  descricao?: string | null;
  imagemUrl?: string | null;
  percentualDesconto: number;
  minServicosExtra: number;
  /** Qualquer serviço de um parceiro conta para o mínimo, não só os da lista. */
  extrasLivres?: boolean;
  /** Convite digital oferecido a quem cumpre a promoção; percentual 100 = grátis. */
  premioConviteEscalao?: string | null;
  premioConvitePercentual?: number | null;
  premioConviteRotulo?: string | null;
  ativa: boolean;
  inicioEm?: string | null;
  fimEm?: string | null;
  alvo: PromocaoAlvo;
}

export interface PromocaoDetalhe extends PromocaoResumo {
  servicosElegiveis: PromocaoServicoElegivel[];
}

export interface SalvarPromocao {
  titulo: string;
  descricao: string | null;
  imagemUrl: string | null;
  alvoTipo: "espaco" | "servico";
  alvoId: number;
  percentualDesconto: number;
  minServicosExtra: number;
  ativa: boolean;
  inicioEm: string | null;
  fimEm: string | null;
  servicoIds: number[];
  extrasLivres: boolean;
  servicosObrigatorios: number[];
  premioConviteEscalao: string | null;
  premioConvitePercentual: number | null;
}

export interface PromocaoCatalogoItem {
  id: number;
  nome: string;
  descricao?: string | null;
  preco: number;
  imagem?: string | null;
  contratavel: boolean;
  status?: number;
}

export interface PromocaoCatalogos {
  espacos: PromocaoCatalogoItem[];
  servicos: PromocaoCatalogoItem[];
}
