import type { Metadata } from "next";
import { fetchColecoes } from "@/actions/colecao.actions";
import { ColecoesPage } from "@/components/colecoes/ColecoesPage";

export const metadata: Metadata = { title: "Gestão — Coleções" };

export default async function ColecoesPageRoute() {
  return <ColecoesPage colecoes={await fetchColecoes()} />;
}
