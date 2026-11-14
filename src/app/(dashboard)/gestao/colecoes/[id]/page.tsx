import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchColecao } from "@/actions/colecao.actions";
import { ColecaoEditor } from "@/components/colecoes/ColecaoEditor";
import { ErroDetalhe } from "@/components/admin/ErroDetalhe";
import { inteiro } from "@/components/admin/params";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = { title: "Coleção" };

export default async function ColecaoPage({ params }: { params: Promise<{ id: string }> }) {
  const bruto = (await params).id;
  if (bruto === "nova") return <ColecaoEditor colecao={null} />;

  const id = inteiro(bruto);
  if (!id) notFound();
  const res = await fetchColecao(id);
  if (!res.success) {
    return <ErroDetalhe titulo={`Coleção #${id}`} mensagem={res.error} voltar={{ label: "Voltar às coleções", href: ROUTES.GESTAO.COLECOES }} />;
  }
  return <ColecaoEditor colecao={res.data} />;
}
