import type { FiltroAuditoriaAdmin } from "@/types/admin.types";
import { PAGE_SIZE, dataIso, inteiro, opcao, pagina, texto, type SearchParams } from "@/components/admin/params";

export const TABS_AUDITORIA = [
  { id: "todas", label: "Todas" },
  { id: "sucesso", label: "Feitas" },
  { id: "erro", label: "Recusadas" },
] as const;

export type TabAuditoria = (typeof TABS_AUDITORIA)[number]["id"];

export function tabAuditoria(params: SearchParams): TabAuditoria {
  return opcao(params.tab, TABS_AUDITORIA.map((t) => t.id)) ?? "todas";
}

export function filtroAuditoria(params: SearchParams): FiltroAuditoriaAdmin {
  const tab = tabAuditoria(params);
  return {
    usuarioId: inteiro(params.membro),
    recurso: texto(params.recurso),
    resultado: tab === "todas" ? undefined : tab,
    // A pesquisa é por número: o ID de uma reserva, conta, espaço ou pagamento.
    alvoId: inteiro(params.q),
    de: dataIso(params.de),
    ate: dataIso(params.ate),
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
}
