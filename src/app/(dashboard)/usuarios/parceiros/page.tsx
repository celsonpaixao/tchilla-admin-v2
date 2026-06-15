import type { Metadata } from "next";
import { fetchAgencias } from "@/actions/agencia.actions";
import { ParceirosPage } from "@/components/parceiros/ParceirosPage";

export const metadata: Metadata = { title: "Usuários — Parceiros" };

export default async function ParceirosPageRoute() {
  const result = await fetchAgencias();
  return <ParceirosPage initialAgencias={result.success ? result.data : []} />;
}
