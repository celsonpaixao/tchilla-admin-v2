import type { Metadata } from "next";
import { fetchClientes } from "@/actions/cliente.actions";
import { CampanhasPage } from "@/components/notificacoes/CampanhasPage";

export const metadata: Metadata = { title: "Gestão — Campanhas" };

export default async function CampanhasPageRoute() {
  const result = await fetchClientes();
  return <CampanhasPage clientes={result.success ? result.data : []} />;
}
