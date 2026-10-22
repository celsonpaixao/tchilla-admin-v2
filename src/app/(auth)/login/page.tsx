import type { Metadata } from "next";
import { LoginClient } from "@/components/auth/LoginClient";

const title = "Entrar";
const description =
  "Aceda ao painel administrativo da Tchilla para gerir reservas, clientes, parceiros, pagamentos e configurações.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "pt_AO",
    title,
    description,
    images: [
      {
        url: "/assets/tchilla-simbolo-principal.png",
        width: 1200,
        height: 630,
        alt: "Entrar no Tchilla Admin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/tchilla-simbolo-principal.png"],
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
