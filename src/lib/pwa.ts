import { SERVICE_WORKER_URL } from "@/constants/app.constants";

let registration: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * Regista o service worker único da app (PWA + push do Firebase).
 * Idempotente: chamadas repetidas devolvem a mesma registration.
 */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  registration ??= navigator.serviceWorker
    .register(SERVICE_WORKER_URL, { scope: "/", updateViaCache: "none" })
    .catch((err) => {
      console.error("[SW] Falha ao registar o service worker", err);
      registration = null;
      return null;
    });

  return registration;
}
