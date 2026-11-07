import type { Metadata } from "next";
import { fetchAuditoria, fetchRecursosAuditoria, fetchUsuariosAdmin } from "@/actions/admin.actions";
import { AuditoriaPage } from "@/components/auditoria/AuditoriaPage";
import { filtroAuditoria, tabAuditoria } from "@/components/auditoria/filtros";
import type { SearchParams } from "@/components/admin/params";

export const metadata: Metadata = { title: "Auditoria" };

export default async function AuditoriaPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filtro = filtroAuditoria(params);
  const [lista, equipa, recursos] = await Promise.all([
    fetchAuditoria(filtro),
    fetchUsuariosAdmin({ tipo: "equipa", estado: "todos", ordem: "nome", pageSize: 100 }),
    fetchRecursosAuditoria(),
  ]);

  return (
    <AuditoriaPage
      tab={tabAuditoria(params)}
      filtro={filtro}
      lista={lista}
      equipa={equipa.success ? equipa.data.data : []}
      recursos={recursos.success ? recursos.data : []}
    />
  );
}
