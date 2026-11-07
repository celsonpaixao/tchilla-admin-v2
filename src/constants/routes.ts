export const ROUTES = {
  LOGIN: "/login",
  /** Apaga o cookie de um token inválido e redireciona para o login. */
  SESSAO_EXPIRADA: "/api/auth/sessao-expirada",
  HOME: "/reservas/relatorio",

  RESERVAS: {
    RELATORIO: "/reservas/relatorio",
    LISTAGEM: "/reservas/listagem",
    HISTORICO: "/reservas/historico",
    DETALHE: (id: number) => `/reservas/${id}`,
  },

  GESTAO: {
    CATEGORIAS: "/gestao/categorias",
    SUPERVISORES: "/gestao/supervisores",
    CAMPANHAS: "/gestao/campanhas",
    PROMOCOES: "/gestao/promocoes",
    ESPACOS: "/gestao/espacos",
    CATALOGO: "/gestao/catalogo",
    AVALIACOES: "/gestao/avaliacoes",
    CONVITES: "/gestao/convites",
  },

  USUARIOS: {
    CLIENTES: "/usuarios/clientes",
    PARCEIROS: "/usuarios/parceiros",
    RELATORIO: "/usuarios/relatorio",
    DETALHE: (id: number) => `/usuarios/${id}`,
  },

  FINANCEIRO: {
    PAGAMENTOS: "/financeiro/pagamentos",
    COMISSOES: "/financeiro/comissoes",
    POR_PARCEIRO: "/financeiro/parceiros",
  },

  ANALISE: {
    ORCAMENTOS: "/analise/orcamentos",
  },

  CONFIGURACOES: "/configuracoes",
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN];
