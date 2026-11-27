import { SERVICE_WORKER_URL } from "@/constants/app.constants";

let registration: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * URL do service worker com a configuração pública do Firebase deste ambiente.
 * O SW não tem acesso a process.env; antes tinha o projeto "tchilla-hmg" fixo, o que em
 * produção (projeto "tchillaapp") o ligava ao Firebase errado.
 */
export function urlDoServiceWorker(): string {
  const config: Record<string, string | undefined> = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const qs = new URLSearchParams(
    Object.entries(config).filter((e): e is [string, string] => !!e[1])
  );
  return `${SERVICE_WORKER_URL}?${qs}`;
}

/**
 * Regista o service worker único da app (PWA + push do Firebase).
 * Idempotente: chamadas repetidas devolvem a mesma registration.
 */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  registration ??= navigator.serviceWorker
    .register(urlDoServiceWorker(), { scope: "/", updateViaCache: "none" })
    .catch((err) => {
      console.error("[SW] Falha ao registar o service worker", err);
      registration = null;
      return null;
    });

  return registration;
}
