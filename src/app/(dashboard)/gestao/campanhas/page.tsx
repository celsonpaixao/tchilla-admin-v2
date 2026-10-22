import type { Metadata } from "next";
import { fetchClientes } from "@/actions/cliente.actions";
import { fetchAgencias } from "@/actions/agencia.actions";
import { fetchCupons } from "@/actions/cupom.actions";
import { CampanhasPage } from "@/components/notificacoes/CampanhasPage";

export const metadata: Metadata = { title: "Gestão — Campanhas" };

export default async function CampanhasPageRoute() {
  const [clientesResult, agenciasResult, cuponsResult] = await Promise.all([
    fetchClientes(),
    fetchAgencias(),
    fetchCupons(),
  ]);

  return (
    <CampanhasPage
      clientes={clientesResult.success ? clientesResult.data : []}
      agencias={agenciasResult.success ? agenciasResult.data : []}
      cupons={cuponsResult.success ? cuponsResult.data : []}
    />
  );
}
