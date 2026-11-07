import type { FiltroCatalogoAdmin, FiltroComprasBilhetes, FiltroEventosAdmin } from "@/types/admin.types";
import { PAGE_SIZE, dataIso, inteiro, opcao, pagina, texto, um, type SearchParams } from "@/components/admin/params";

export const TABS_CATALOGO = [
  { id: "servicos", label: "Serviços" },
  { id: "combos", label: "Combos" },
  { id: "eventos", label: "Eventos" },
  { id: "bilhetes", label: "Bilhetes vendidos" },
] as const;

export type TabCatalogo = (typeof TABS_CATALOGO)[number]["id"];

export function tabCatalogo(params: SearchParams): TabCatalogo {
  return opcao(params.tab, TABS_CATALOGO.map((t) => t.id)) ?? "servicos";
}

export function filtroCatalogo(params: SearchParams): FiltroCatalogoAdmin {
  return {
    pesquisa: texto(params.q),
    agenciaId: inteiro(params.agencia),
    estado: opcao(params.estado, ["Ativo", "PendenteAprovacao", "Inativo"] as const),
    incluirApagados: um(params.apagados) === "1" || undefined,
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
}

export function filtroEventos(params: SearchParams): FiltroEventosAdmin {
  return {
    pesquisa: texto(params.q),
    agenciaId: inteiro(params.agencia),
    quando: opcao(params.quando, ["futuros", "passados"] as const),
    de: dataIso(params.de),
    ate: dataIso(params.ate),
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
}

export function filtroBilhetes(params: SearchParams): FiltroComprasBilhetes {
  return {
    estado: opcao(params.estado, ["Pago", "Pendente"] as const),
    eventoId: inteiro(params.evento),
    clienteId: inteiro(params.cliente),
    pesquisa: texto(params.q),
    de: dataIso(params.de),
    ate: dataIso(params.ate),
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
}
