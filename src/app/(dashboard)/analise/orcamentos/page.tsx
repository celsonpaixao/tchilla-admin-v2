import type { Metadata } from "next";
import { OrcamentosRankingPage } from "@/components/orcamentos/OrcamentosRankingPage";

export const metadata: Metadata = { title: "Análise — Orçamentos" };

export default function OrcamentosPageRoute() {
  return <OrcamentosRankingPage />;
}
