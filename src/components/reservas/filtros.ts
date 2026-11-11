import type { FiltroReservasAdmin } from "@/types/admin.types";
import { PAGE_SIZE, dataIso, hojeIso, inteiro, opcao, pagina, texto, um, type SearchParams } from "@/components/admin/params";

export const TABS_RESERVAS = [
  { id: "todas", label: "Todas" },
  { id: "pendentes", label: "Pendentes" },
  { id: "confirmadas", label: "Confirmadas" },
  { id: "concluidas", label: "Concluídas" },
  { id: "canceladas", label: "Canceladas" },
] as const;

export type TabReservas = (typeof TABS_RESERVAS)[number]["id"];

const ESTADO_DA_TAB: Record<TabReservas, string | undefined> = {
  todas: undefined,
  pendentes: "Pendente",
  confirmadas: "Confirmado",
  concluidas: "Concluido",
  canceladas: "Cancelado",
};

export function tabReservas(params: SearchParams): TabReservas {
  return opcao(params.tab, TABS_RESERVAS.map((t) => t.id)) ?? "todas";
}

/**
 * Filtros da lista. No histórico, por omissão, mostra os eventos até ontem, do mais recente para o mais antigo.
 */
export function filtroReservas(params: SearchParams, historico = false): FiltroReservasAdmin {
  const pago = um(params.pago);
  return {
    estado: ESTADO_DA_TAB[tabReservas(params)],
    tipo: opcao(params.tipo, ["espaco", "servico", "combo"] as const),
    agenciaId: inteiro(params.agencia),
    clienteId: inteiro(params.cliente),
    pago: pago === "sim" ? true : pago === "nao" ? false : undefined,
    de: dataIso(params.de),
    ate: dataIso(params.ate) ?? (historico ? hojeIso(-1) : undefined),
    pesquisa: texto(params.q),
    ordem: opcao(params.ordem, ["recentes", "data", "valor"] as const) ?? (historico ? "data" : undefined),
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
}

/** Os mesmos filtros, no formato que a exportação CSV aceita. */
export function queryExportacao(f: FiltroReservasAdmin) {
  const q = new URLSearchParams();
  const pares: [string, unknown][] = [
    ["estado", f.estado], ["tipo", f.tipo], ["agenciaId", f.agenciaId], ["clienteId", f.clienteId],
    ["pago", f.pago], ["de", f.de], ["ate", f.ate], ["pesquisa", f.pesquisa], ["ordem", f.ordem],
  ];
  for (const [k, v] of pares) if (v !== undefined && v !== "") q.set(k, String(v));
  return q.toString();
}
