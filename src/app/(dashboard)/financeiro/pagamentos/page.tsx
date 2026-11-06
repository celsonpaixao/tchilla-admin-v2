import type { Metadata } from "next";
import { fetchPagamentos, fetchResumoFinanceiro } from "@/actions/payment.actions";
import { PaymentsPage } from "@/components/pagamentos/PaymentsPage";
import { filtroPagamentos, tabPagamentos, type SearchParams } from "@/components/pagamentos/filtros";

export const metadata: Metadata = { title: "Financeiro — Pagamentos" };

export default async function PagamentosPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filtro = filtroPagamentos(params);
  const [lista, resumo] = await Promise.all([
    fetchPagamentos(filtro),
    fetchResumoFinanceiro({ de: filtro.de, ate: filtro.ate }),
  ]);

  return <PaymentsPage tab={tabPagamentos(params)} filtro={filtro} lista={lista} resumo={resumo} />;
}
