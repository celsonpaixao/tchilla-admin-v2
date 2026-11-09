import { PAGE_SIZE, opcao, pagina, texto, type SearchParams } from "@/components/admin/params";
import type { FiltroPostsAdmin } from "@/types/publicacao.types";

export const VISTAS = ["rever", "publicadas", "retiradas", "contestacoes", "destaques"] as const;
export type Vista = (typeof VISTAS)[number];

export function vista(params: SearchParams): Vista {
  return opcao(params.vista, VISTAS) ?? "rever";
}

export const RETIRADAS = ["removido", "recusado"] as const;
export const ESTADOS_CONTESTACAO = ["aberta", "aceite", "recusada", "todas"] as const;

export function filtroPosts(params: SearchParams): FiltroPostsAdmin {
  const v = vista(params);
  return {
    estado: v === "rever" ? "em_revisao" : v === "publicadas" ? "publicado" : opcao(params.estado, RETIRADAS) ?? "removido",
    autor: opcao(params.autor, ["cliente", "parceiro"] as const),
    pesquisa: texto(params.q),
    pagina: pagina(params.pagina),
    tamanho: PAGE_SIZE,
  };
}

export function estadoContestacao(params: SearchParams) {
  return opcao(params.cestado, ESTADOS_CONTESTACAO) ?? "aberta";
}
