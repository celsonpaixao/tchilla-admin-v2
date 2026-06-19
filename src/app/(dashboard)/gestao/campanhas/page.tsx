import type { Metadata } from "next";
import { fetchClientes } from "@/actions/cliente.actions";
import { fetchAgencias } from "@/actions/agencia.actions";
import { CampanhasPage } from "@/components/notificacoes/CampanhasPage";

export const metadata: Metadata = { title: "Gestão — Campanhas" };

export default async function CampanhasPageRoute() {
  const [clientesResult, agenciasResult] = await Promise.all([
    fetchClientes(),
    fetchAgencias(),
  ]);

  return (
    <CampanhasPage
      clientes={clientesResult.success ? clientesResult.data : []}
      agencias={agenciasResult.success ? agenciasResult.data : []}
    />
  );
}
