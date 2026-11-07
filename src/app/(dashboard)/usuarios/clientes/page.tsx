import type { Metadata } from "next";
import { fetchResumoUsuarios, fetchUsuariosAdmin } from "@/actions/admin.actions";
import { ClientesPage } from "@/components/clientes/ClientesPage";
import { filtroUsuarios, tabUsuarios } from "@/components/clientes/filtros";
import type { SearchParams } from "@/components/admin/params";

export const metadata: Metadata = { title: "Usuários — Clientes" };

export default async function ClientesPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filtro = filtroUsuarios(params);
  const [lista, resumo] = await Promise.all([fetchUsuariosAdmin(filtro), fetchResumoUsuarios()]);

  return <ClientesPage tab={tabUsuarios(params)} filtro={filtro} lista={lista} resumo={resumo} />;
}
