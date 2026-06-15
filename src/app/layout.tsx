import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tchilla Admin",
    template: "%s — Tchilla Admin",
  },
  description: "Painel administrativo interno da Tchilla",
  robots: { index: false, follow: false },
  icons: {
    icon:  "/admin_favicon.png",
    apple: "/admin_favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
