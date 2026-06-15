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
      {/* Sidebar */}
      <AppSidebar user={user} />

      {/* Topbar */}
      <Topbar user={user} />

      {/* Conteúdo principal */}
      <main
        className="min-h-screen"
        style={{
          paddingLeft: "var(--sidebar-width)",
          paddingTop: "var(--topbar-height)",
        }}
      >
        {/* Skip link para acessibilidade */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1 focus:rounded focus:text-sm focus:font-medium"
          style={{ background: "var(--blue)", color: "white" }}
        >
          Ir para o conteúdo
        </a>

        <div id="main-content" className="p-6">
          {children}
        </div>
      </main>
    </DashboardProviders>
  );
}
