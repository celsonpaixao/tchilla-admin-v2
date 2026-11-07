import type { FiltroAvaliacoesAdmin } from "@/types/admin.types";
import { PAGE_SIZE, dataIso, inteiro, opcao, pagina, texto, um, type SearchParams } from "@/components/admin/params";

export const FAIXAS_NOTA = ["todas", "negativas", "neutras", "positivas"] as const;
export type FaixaNota = (typeof FAIXAS_NOTA)[number];

const LIMITES: Record<FaixaNota, [number | undefined, number | undefined]> = {
  todas: [undefined, undefined],
  negativas: [1, 2],
  neutras: [3, 3],
  positivas: [4, 5],
};

export function faixaNota(params: SearchParams): FaixaNota {
  return opcao(params.nota, FAIXAS_NOTA) ?? "todas";
}

export function filtroAvaliacoes(params: SearchParams): FiltroAvaliacoesAdmin {
  const [notaMin, notaMax] = LIMITES[faixaNota(params)];
  return {
    notaMin,
    notaMax,
    alvo: opcao(params.alvo, ["espaco", "servico", "combo", "evento"] as const),
    agenciaId: inteiro(params.agencia),
    usuarioId: inteiro(params.usuario),
    incluirApagadas: um(params.apagadas) === "1" || undefined,
    pesquisa: texto(params.q),
    de: dataIso(params.de),
    ate: dataIso(params.ate),
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
}
