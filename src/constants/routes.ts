export const ROUTES = {
  LOGIN: "/login",
  HOME: "/reservas/relatorio",

  RESERVAS: {
    RELATORIO: "/reservas/relatorio",
    LISTAGEM: "/reservas/listagem",
    HISTORICO: "/reservas/historico",
  },

  GESTAO: {
    CATEGORIAS: "/gestao/categorias",
    SUPERVISORES: "/gestao/supervisores",
    CAMPANHAS: "/gestao/campanhas",
    CUPONS: "/gestao/cupons",
  },

  USUARIOS: {
    CLIENTES: "/usuarios/clientes",
    PARCEIROS: "/usuarios/parceiros",
    RELATORIO: "/usuarios/relatorio",
  },

  FINANCEIRO: {
    PAGAMENTOS: "/financeiro/pagamentos",
  },

  ANALISE: {
    ORCAMENTOS: "/analise/orcamentos",
  },

  CONFIGURACOES: "/configuracoes",
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN];
