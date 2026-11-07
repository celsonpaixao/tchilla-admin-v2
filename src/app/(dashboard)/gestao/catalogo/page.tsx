import type { Metadata } from "next";
import { fetchCombosAdmin, fetchComprasBilhetes, fetchEventosAdmin, fetchServicosAdmin } from "@/actions/admin.actions";
import { CatalogoPage, type DadosCatalogo } from "@/components/catalogo/CatalogoPage";
import { filtroBilhetes, filtroCatalogo, filtroEventos, tabCatalogo } from "@/components/catalogo/filtros";
import type { SearchParams } from "@/components/admin/params";

export const metadata: Metadata = { title: "Gestão — Catálogo" };

/** Só o separador aberto vai ao servidor. */
export default async function CatalogoPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const tab = tabCatalogo(params);

  let dados: DadosCatalogo;
  if (tab === "combos") {
    const filtro = filtroCatalogo(params);
    dados = { tab, filtro, lista: await fetchCombosAdmin(filtro) };
  } else if (tab === "eventos") {
    const filtro = filtroEventos(params);
    dados = { tab, filtro, lista: await fetchEventosAdmin(filtro) };
  } else if (tab === "bilhetes") {
    const filtro = filtroBilhetes(params);
    dados = { tab, filtro, lista: await fetchComprasBilhetes(filtro) };
  } else {
    const filtro = filtroCatalogo(params);
    dados = { tab: "servicos", filtro, lista: await fetchServicosAdmin(filtro) };
  }

  return <CatalogoPage dados={dados} />;
}
