import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAtividadeUsuario } from "@/actions/admin.actions";
import { UsuarioDetalhePage } from "@/components/clientes/UsuarioDetalhePage";
import { ErroDetalhe } from "@/components/admin/ErroDetalhe";
import { inteiro } from "@/components/admin/params";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = { title: "Utilizador" };

export default async function UsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const id = inteiro((await params).id);
  if (!id) notFound();

  const res = await fetchAtividadeUsuario(id);
  if (!res.success) {
    return <ErroDetalhe titulo={`Utilizador #${id}`} mensagem={res.error} voltar={{ label: "Voltar aos clientes", href: ROUTES.USUARIOS.CLIENTES }} />;
  }
  return <UsuarioDetalhePage atividade={res.data} />;
}
