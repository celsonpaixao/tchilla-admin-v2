import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { ConfiguracoesPage } from "@/components/dashboard/ConfiguracoesPage";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPageRoute() {
  const user = await getSession();
  return <ConfiguracoesPage user={user} />;
}
