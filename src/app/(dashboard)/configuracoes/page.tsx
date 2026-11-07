import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { fetchConfiguracoesPlataforma } from "@/actions/admin.actions";
import { ConfiguracoesPage } from "@/components/dashboard/ConfiguracoesPage";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPageRoute() {
  const [user, configuracoes] = await Promise.all([getSession(), fetchConfiguracoesPlataforma()]);
  return <ConfiguracoesPage user={user} configuracoes={configuracoes} />;
}
