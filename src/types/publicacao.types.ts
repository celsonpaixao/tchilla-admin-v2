import type { PessoaAdmin } from "@/types/admin.types";

/** Camada social: publicações vistas pela equipa (GET /api/Post/admin…). */

export type EstadoPost = "rascunho" | "em_revisao" | "publicado" | "recusado" | "removido";
export type EstadoMedia = "pendente" | "a_processar" | "pronto" | "falhou";
export type TipoAnuncio = "servico" | "espaco" | "combo";

export interface PostMediaAdmin {
  id: number;
  tipo: "foto" | "video";
  url: string | null;
  miniaturaUrl: string | null;
  ordem: number;
  duracaoS: number | null;
  largura: number | null;
  altura: number | null;
  estado: EstadoMedia;
  erro: string | null;
}

export interface AnuncioPost {
  tipo: TipoAnuncio;
  id: number;
  nome: string | null;
}

export interface PostAdmin {
  id: number;
  estado: EstadoPost;
  autorTipo: "cliente" | "parceiro";
  autor: PessoaAdmin | null;
  agenciaId: number | null;
  agenciaNome: string | null;
  legenda: string | null;
  faixaCusto: string | null;
  media: PostMediaAdmin[];
  anuncios: AnuncioPost[];
  verificado: boolean;
  reservaId: number | null;
  criadoEm: string;
  enviadoRevisaoEm: string | null;
  prazoEsgotado: boolean;
  publicadoEm: string | null;
  moderadoEm: string | null;
  moderadoPor: string | null;
  motivoModeracao: string | null;
  contestacoesAbertas: number;
  emDestaque: boolean;
}

export interface ContadoresPosts {
  emRevisao: number;
  prazoEsgotado: number;
  contestacoesAbertas: number;
  destaquesAtivos: number;
}

export interface PostResumoAdmin {
  id: number;
  estado: EstadoPost;
  autorTipo: "cliente" | "parceiro";
  autorNome: string | null;
  legenda: string | null;
  capa: string | null;
  verificado: boolean;
  anuncios: AnuncioPost[];
}

export interface ContestacaoAdmin {
  id: number;
  post: PostResumoAdmin;
  agenciaId: number;
  agenciaNome: string | null;
  motivo: "dados_pessoais" | "ofensivo" | "informacao_falsa" | "outro";
  descricao: string | null;
  estado: "aberta" | "aceite" | "recusada";
  decisao: string | null;
  criadoEm: string;
  decididoEm: string | null;
  decididoPor: string | null;
}

export interface DestaqueAdmin {
  id: number;
  ordem: number;
  ativoDe: string | null;
  ativoAte: string | null;
  ativo: boolean;
  post: PostResumoAdmin;
}

export interface FiltroPostsAdmin {
  estado?: EstadoPost;
  autor?: "cliente" | "parceiro";
  pesquisa?: string;
  pagina?: number;
  tamanho?: number;
}

export interface DestaqueEntrada {
  postId: number;
  ordem: number;
  ativoDe?: string | null;
  ativoAte?: string | null;
}

export const FAIXAS_CUSTO: Record<string, string> = {
  ate_500mil: "Até 500 mil Kz",
  "500mil_1milhao": "Entre 500 mil e 1 milhão Kz",
  "1_3milhoes": "Entre 1 e 3 milhões Kz",
  "3_5milhoes": "Entre 3 e 5 milhões Kz",
  acima_5milhoes: "Mais de 5 milhões Kz",
};

export const MOTIVOS_CONTESTACAO: Record<ContestacaoAdmin["motivo"], string> = {
  dados_pessoais: "Dados pessoais",
  ofensivo: "Conteúdo ofensivo",
  informacao_falsa: "Informação falsa",
  outro: "Outro",
};
