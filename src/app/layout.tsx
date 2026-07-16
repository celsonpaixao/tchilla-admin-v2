import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

const siteName = "Tchilla Admin";
const siteDescription =
  "Painel administrativo interno da Tchilla para gerir reservas, utilizadores, parceiros, pagamentos, campanhas e configurações com acesso restrito.";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: "%s — Tchilla Admin",
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: "Tchilla" }],
  creator: "Tchilla",
  publisher: "Tchilla",
  keywords: [
    "Tchilla Admin",
    "painel administrativo",
    "reservas",
    "parceiros",
    "pagamentos",
    "configurações",
  ],
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "pt_AO",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/assets/tchilla-simbolo-principal.png",
        width: 1200,
        height: 630,
        alt: "Tchilla Admin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/assets/tchilla-simbolo-principal.png"],
  },
  icons: {
    icon: "/admin_favicon.png",
    apple: "/admin_favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E2A42",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              borderRadius: "10px",
            },
          }}
        />
      </body>
    </html>
  );
}
