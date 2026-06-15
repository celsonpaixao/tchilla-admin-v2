import type { Metadata } from "next";
import { fetchClientes } from "@/actions/cliente.actions";
import { ClientesPage } from "@/components/clientes/ClientesPage";

export const metadata: Metadata = { title: "Usuários — Clientes" };

export default async function ClientesPageRoute() {
  const result = await fetchClientes();
  return <ClientesPage initialClientes={result.success ? result.data : []} />;
}
