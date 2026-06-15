import type { Metadata } from "next";
import { fetchSupervisores } from "@/actions/supervisor.actions";
import { SupervisoresPage } from "@/components/supervisores/SupervisoresPage";

export const metadata: Metadata = { title: "Gestão — Supervisores" };

export default async function SupervisoresPageRoute() {
  const result = await fetchSupervisores();
  return <SupervisoresPage initialSupervisores={result.success ? result.data : []} />;
}
