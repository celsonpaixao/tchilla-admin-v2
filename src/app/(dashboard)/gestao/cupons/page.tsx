import type { Metadata } from "next";
import { fetchCupons } from "@/actions/cupom.actions";
import { CuponsPage } from "@/components/cupons/CuponsPage";

export const metadata: Metadata = { title: "Gestão — Cupons" };

export default async function CuponsPageRoute() {
  const result = await fetchCupons();
  return <CuponsPage initialCupons={result.success ? result.data : []} />;
}
