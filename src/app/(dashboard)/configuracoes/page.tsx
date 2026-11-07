import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { fetchConfiguracoesPlataforma } from "@/actions/admin.actions";
import { ConfiguracoesPage } from "@/components/dashboard/ConfiguracoesPage";
import { papelDaSessao } from "@/lib/auth/papel";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPageRoute() {
  const [user, configuracoes, papel] = await Promise.all([getSession(), fetchConfiguracoesPlataforma(), papelDaSessao()]);
  return <ConfiguracoesPage user={user} configuracoes={configuracoes} papel={papel} />;
}
