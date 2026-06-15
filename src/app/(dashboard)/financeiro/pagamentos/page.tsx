import type { Metadata } from "next";
import { fetchPagamentos } from "@/actions/payment.actions";
import { PaymentsPage } from "@/components/pagamentos/PaymentsPage";

export const metadata: Metadata = { title: "Financeiro — Pagamentos" };

export default async function PagamentosPageRoute() {
  const result = await fetchPagamentos();
  return <PaymentsPage initialPagamentos={result.success ? result.data : []} />;
}
