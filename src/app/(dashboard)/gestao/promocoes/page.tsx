import type { Metadata } from "next";
import { fetchPromocaoCatalogos, fetchPromocoes } from "@/actions/promocao.actions";
import { PromocoesPage } from "@/components/promocoes/PromocoesPage";

export const metadata: Metadata = { title: "Gestão — Promoções" };

export default async function PromocoesPageRoute() {
  const [promocoesResult, catalogosResult] = await Promise.all([
    fetchPromocoes(),
    fetchPromocaoCatalogos(),
  ]);

  return (
    <PromocoesPage
      initialPromocoes={promocoesResult.success ? promocoesResult.data : []}
      catalogos={catalogosResult.success ? catalogosResult.data : { espacos: [], servicos: [] }}
      initialErrors={[
        !promocoesResult.success ? promocoesResult.error : null,
        !catalogosResult.success ? catalogosResult.error : null,
      ].filter((error): error is string => error !== null)}
    />
  );
}
