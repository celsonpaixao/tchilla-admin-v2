import type { FiltroUsuariosAdmin, TipoUsuarioAdmin } from "@/types/admin.types";
import { PAGE_SIZE, dataIso, opcao, pagina, texto, type SearchParams } from "@/components/admin/params";

export const TABS_USUARIOS = [
  { id: "ativos", label: "Ativos" },
  { id: "bloqueados", label: "Bloqueados" },
  { id: "apagados", label: "Apagados" },
  { id: "todos", label: "Todos" },
] as const;

export type TabUsuarios = (typeof TABS_USUARIOS)[number]["id"];

const TIPOS: readonly (TipoUsuarioAdmin | "todos")[] = ["cliente", "parceiro", "equipa", "todos"];

export function tabUsuarios(params: SearchParams): TabUsuarios {
  return opcao(params.tab, TABS_USUARIOS.map((t) => t.id)) ?? "ativos";
}

/** Por omissão só clientes; "todos" mostra também parceiros e equipa. */
export function filtroUsuarios(params: SearchParams): FiltroUsuariosAdmin {
  const tipo = opcao(params.tipo, TIPOS) ?? "cliente";
  return {
    estado: tabUsuarios(params),
    tipo: tipo === "todos" ? undefined : tipo,
    pesquisa: texto(params.q),
    de: dataIso(params.de),
    ate: dataIso(params.ate),
    ordem: opcao(params.ordem, ["recentes", "nome", "reservas"] as const),
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
}
