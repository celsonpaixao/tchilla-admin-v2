/* GET /api/Metricas/social: métricas da camada social (CAMADA_SOCIAL_API.md, secção 3). */

export interface GrupoAnuncios {
  anuncios: number;
  visualizacoes: number;
  pedidosReserva: number;
  /** Pedidos de reserva por cada 100 visualizações. */
  pedidosPor100Visualizacoes: number;
}

export interface PostAtribuido {
  postId: number;
  autor: string | null;
  doParceiro: boolean;
  cliques: number;
  reservas: number;
  valor: number;
}

export interface ReservaAtribuida {
  reservaId: number;
  postId: number;
  anuncio: string;
  status: string;
  pago: boolean;
  valor: number;
  criadaEm: string;
  cliqueEm: string;
}

export interface MetricasSociais {
  inicio: string;
  fim: string;
  janelaDias: number;
  parceiros: { ativos: number; comPost: number; percentagem: number };
  anuncios: { comPosts: GrupoAnuncios; semPosts: GrupoAnuncios };
  atribuicao: {
    cliquesReservarDePosts: number;
    reservas: number;
    validadas: number;
    valorReservas: number;
    posts: PostAtribuido[];
    ultimas: ReservaAtribuida[];
  };
}
