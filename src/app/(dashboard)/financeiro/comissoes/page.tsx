import type { Metadata } from "next";
import { fetchComissoes, fetchResumoFinanceiro } from "@/actions/payment.actions";
import { ComissoesPage } from "@/components/pagamentos/ComissoesPage";
import { filtroComissoes, tabComissoes, type SearchParams } from "@/components/pagamentos/filtros";

export const metadata: Metadata = { title: "Financeiro — Comissões" };

export default async function ComissoesPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const tab = tabComissoes(params);
  const [lista, resumo, porConfirmar] = await Promise.all([
    fetchComissoes(filtroComissoes(params)),
    fetchResumoFinanceiro(),
    fetchComissoes({ porConfirmar: true, pageSize: 1 }),
  ]);

  return (
    <ComissoesPage
      tab={tab}
      lista={lista}
      resumo={resumo}
      porConfirmar={porConfirmar.success ? porConfirmar.data.totalItems : 0}
    />
  );
}
