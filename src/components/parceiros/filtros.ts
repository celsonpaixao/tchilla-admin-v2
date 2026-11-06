import type { EstadoParceiro, FiltroParceiros } from "@/types/agencia.types";

export type SearchParams = Record<string, string | string[] | undefined>;

const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export const PAGE_SIZE_PARCEIROS = 20;

export const TABS_PARCEIROS = [
  { id: "pendentes", label: "Por aprovar" },
  { id: "aprovados", label: "Aprovados" },
  { id: "rejeitados", label: "Rejeitados" },
  { id: "suspensos", label: "Suspensos" },
  { id: "todos", label: "Todos" },
] as const;

export type TabParceiros = (typeof TABS_PARCEIROS)[number]["id"];

const ESTADO_DA_TAB: Record<TabParceiros, EstadoParceiro | undefined> = {
  pendentes: "Pendente",
  aprovados: "Aprovado",
  rejeitados: "Rejeitado",
  suspensos: "Suspenso",
  todos: undefined,
};

/** Sem tab no URL: abre na fila de aprovação. */
export function tabParceiros(params: SearchParams): TabParceiros {
  const t = um(params.tab);
  return TABS_PARCEIROS.some((x) => x.id === t) ? (t as TabParceiros) : "pendentes";
}

export function filtroParceiros(params: SearchParams): FiltroParceiros {
  return {
    estado: ESTADO_DA_TAB[tabParceiros(params)],
    pesquisa: um(params.q)?.trim() || undefined,
    pageNumber: Math.max(1, Number(um(params.pagina)) || 1),
    pageSize: PAGE_SIZE_PARCEIROS,
  };
}
