import type { Metadata } from "next";
import { fetchResumoUsuarios, fetchUsuariosAdmin } from "@/actions/admin.actions";
import { ClientesPage } from "@/components/clientes/ClientesPage";
import { filtroUsuarios, tabUsuarios } from "@/components/clientes/filtros";
import type { SearchParams } from "@/components/admin/params";
import { papelDaSessao } from "@/lib/auth/papel";

export const metadata: Metadata = { title: "Usuários — Clientes" };

export default async function ClientesPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filtro = filtroUsuarios(params);
  const [lista, resumo, papel] = await Promise.all([fetchUsuariosAdmin(filtro), fetchResumoUsuarios(), papelDaSessao()]);

  return <ClientesPage tab={tabUsuarios(params)} filtro={filtro} lista={lista} resumo={resumo} podeApagar={papel === "Admin"} />;
}
