import type { Metadata } from "next";
import { fetchConvitesAdmin } from "@/actions/admin.actions";
import { ConvitesPage } from "@/components/convites/ConvitesPage";
import { PAGE_SIZE, dataIso, opcao, pagina, texto, type SearchParams } from "@/components/admin/params";

export const metadata: Metadata = { title: "Gestão — Convites" };

export default async function ConvitesPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filtro = {
    pesquisa: texto(params.q),
    escalao: texto(params.escalao),
    quando: opcao(params.quando, ["futuros", "passados"] as const),
    de: dataIso(params.de),
    ate: dataIso(params.ate),
    pageNumber: pagina(params.pagina),
    pageSize: PAGE_SIZE,
  };
  return <ConvitesPage filtro={filtro} lista={await fetchConvitesAdmin(filtro)} />;
}
