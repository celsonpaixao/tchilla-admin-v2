import type { Metadata } from "next";
import { fetchFinanceiroParceiros } from "@/actions/admin.actions";
import { FinanceiroParceirosPage } from "@/components/pagamentos/FinanceiroParceirosPage";
import { dataIso, type SearchParams } from "@/components/admin/params";

export const metadata: Metadata = { title: "Financeiro — Por parceiro" };

export default async function FinanceiroParceirosRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const periodo = { de: dataIso(params.de), ate: dataIso(params.ate) };
  return <FinanceiroParceirosPage periodo={periodo} lista={await fetchFinanceiroParceiros(periodo)} />;
}
