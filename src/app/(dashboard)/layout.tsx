import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AppSidebar } from "@/components/global/AppSidebar";
import { Topbar } from "@/components/global/Topbar";
import { ROUTES } from "@/constants/routes";
import { DashboardProviders } from "./providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <DashboardProviders user={user}>
      {/* Sidebar — position: fixed, fora do fluxo */}
      <AppSidebar user={user} />

      {/* Área de conteúdo — ocupa só o espaço à direita da sidebar */}
      <main
        className="min-h-screen flex flex-col"
        style={{ paddingLeft: "var(--sidebar-width)" }}
      >
        {/* Topbar dentro do main → sticky apenas na área de conteúdo, não cobre a sidebar */}
        <Topbar user={user} />

        {/* Skip link para acessibilidade */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1 focus:rounded focus:text-sm focus:font-medium"
          style={{ background: "var(--blue)", color: "white" }}
        >
          Ir para o conteúdo
        </a>

        <div id="main-content" className="flex-1 p-6">
          {children}
        </div>
      </main>
    </DashboardProviders>
  );
}
