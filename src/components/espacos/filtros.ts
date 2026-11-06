import type { FiltroEspacos } from "@/types/espaco.types";

export type SearchParams = Record<string, string | string[] | undefined>;

const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export const PAGE_SIZE_ESPACOS = 20;

export const TABS_ESPACOS = [
  { id: "publicados", label: "Publicados" },
  { id: "suspensos", label: "Suspensos pela equipa" },
  { id: "rascunhos", label: "Rascunhos" },
  { id: "inativos", label: "Inativos" },
  { id: "todos", label: "Todos" },
] as const;

export type TabEspacos = (typeof TABS_ESPACOS)[number]["id"];

/** Sem tab no URL: abre nos publicados (o que os clientes veem agora). */
export function tabEspacos(params: SearchParams): TabEspacos {
  const t = um(params.tab);
  return TABS_ESPACOS.some((x) => x.id === t) ? (t as TabEspacos) : "publicados";
}

export function filtroEspacos(params: SearchParams): FiltroEspacos {
  const tab = tabEspacos(params);
  return {
    status: tab === "publicados" ? "Publicado" : tab === "rascunhos" ? "Rascunho" : tab === "inativos" ? "Inativo" : undefined,
    suspensosPelaEquipa: tab === "suspensos" || undefined,
    pesquisa: um(params.q)?.trim() || undefined,
    pageNumber: Math.max(1, Number(um(params.pagina)) || 1),
    pageSize: PAGE_SIZE_ESPACOS,
  };
}
