import type { TipoAnuncio } from "./publicacao.types";

export type { TipoAnuncio };

/** Publicação no formato público da API (só o que a página da equipa mostra). */
export interface PostPublico {
  id: number;
  legenda: string | null;
  publicadoEm: string | null;
  verificado: boolean;
  autor: { tipo: "cliente" | "parceiro"; nome: string; foto: string | null };
  media: { tipo: "foto" | "video"; url: string; miniaturaUrl: string | null }[];
}

export type EstadoColecao = "rascunho" | "publicada" | "arquivada";

export interface ColecaoItem {
  id: number;
  tipo: TipoAnuncio;
  anuncioId: number;
  nome: string | null;
  imagem: string | null;
  /** Nome comercial do parceiro (ou o nome do prestador). */
  prestador: string | null;
  /** Papel no evento: "Espaço", "Fotografia"… */
  rotulo: string | null;
  nota: string | null;
  ordem: number;
  /** false quando o anúncio foi apagado entretanto: a app já não o mostra. */
  disponivel: boolean;
}

export interface ColecaoAdmin {
  id: number;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  descricao: string | null;
  /** Capa que a app mostra (a escolhida ou a automática). */
  capa: string | null;
  /** Capa escolhida pela equipa (vazio = automática). */
  capaUrl: string | null;
  dataEvento: string | null;
  totalItens: number;
  estado: EstadoColecao;
  publicadaEm: string | null;
  usuarioId: number | null;
  usuarioNome: string | null;
  itens: ColecaoItem[];
  publicacoes: PostPublico[];
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface ColecaoItemEntrada {
  tipo: TipoAnuncio;
  id: number;
  rotulo: string | null;
  nota: string | null;
}

export interface ColecaoEntrada {
  slug: string;
  titulo: string;
  subtitulo: string | null;
  descricao: string | null;
  capaUrl: string | null;
  dataEvento: string | null;
  usuarioId: number | null;
  estado: EstadoColecao;
  itens: ColecaoItemEntrada[];
}
