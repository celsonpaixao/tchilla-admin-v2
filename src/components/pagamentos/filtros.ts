import type { FiltroComissoes, FiltroPagamentos, MetodoPagamento } from "@/types/payment.types";

export type SearchParams = Record<string, string | string[] | undefined>;

const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const pagina = (v: string | string[] | undefined) => Math.max(1, Number(um(v)) || 1);
const data = (v: string | string[] | undefined) => {
  const s = um(v);
  return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
};

export const PAGE_SIZE = 20;

/* ── Pagamentos ─────────────────────────────────────────────── */

export const TABS_PAGAMENTOS = [
  { id: "todos", label: "Todos" },
  { id: "por-validar", label: "Por validar" },
  { id: "pagos", label: "Pagos" },
  { id: "pendentes", label: "Pendentes" },
  { id: "falhados", label: "Falhados" },
  { id: "rejeitados", label: "Rejeitados" },
] as const;

export type TabPagamentos = (typeof TABS_PAGAMENTOS)[number]["id"];

const METODOS: MetodoPagamento[] = ["MCX", "REFERENCIA", "TRANSFERENCIA"];

export function tabPagamentos(params: SearchParams): TabPagamentos {
  const t = um(params.tab);
  return TABS_PAGAMENTOS.some((x) => x.id === t) ? (t as TabPagamentos) : "todos";
}

export function filtroPagamentos(params: SearchParams): FiltroPagamentos {
  const tab = tabPagamentos(params);
  const metodo = um(params.metodo)?.toUpperCase() as MetodoPagamento | undefined;
  return {
    porValidar: tab === "por-validar" || undefined,
    estado:
      tab === "pagos" ? "Pago" :
      tab === "pendentes" ? "Pendente" :
      tab === "falhados" ? "Falhado" :
      tab === "rejeitados" ? "Rejeitado" :
      undefined,
    metodo: metodo && METODOS.includes(metodo) ? metodo : undefined,
    de: data(params.de),
    ate: data(params.ate),
    pesquisa: um(params.q)?.trim() || undefined,
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
}

/* ── Comissões ──────────────────────────────────────────────── */

export const TABS_COMISSOES = [
  { id: "por-confirmar", label: "Por confirmar" },
  { id: "pendentes", label: "Pendentes" },
  { id: "pagas", label: "Pagas" },
  { id: "canceladas", label: "Canceladas" },
  { id: "todas", label: "Todas" },
] as const;

export type TabComissoes = (typeof TABS_COMISSOES)[number]["id"];

export function tabComissoes(params: SearchParams): TabComissoes {
  const t = um(params.tab);
  return TABS_COMISSOES.some((x) => x.id === t) ? (t as TabComissoes) : "por-confirmar";
}

export function filtroComissoes(params: SearchParams): FiltroComissoes {
  const tab = tabComissoes(params);
  return {
    porConfirmar: tab === "por-confirmar" || undefined,
    estado:
      tab === "pendentes" ? "Pendente" :
      tab === "pagas" ? "Pago" :
      tab === "canceladas" ? "Cancelada" :
      undefined,
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
}
