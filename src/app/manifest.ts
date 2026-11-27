import type { MetadataRoute } from "next";
import { ROUTES } from "@/constants/routes";

// Servido em /manifest.webmanifest; o Next adiciona o <link rel="manifest"> sozinho.
// As cores repetem os tokens --navy e --gray-50: o manifest não lê variáveis CSS.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Tchilla Admin",
    short_name: "Tchilla Admin",
    description:
      "Painel administrativo da Tchilla para gerir reservas, utilizadores, parceiros, pagamentos e campanhas.",
    lang: "pt-AO",
    dir: "ltr",
    start_url: ROUTES.HOME,
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0E2A42",
    theme_color: "#0E2A42",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
