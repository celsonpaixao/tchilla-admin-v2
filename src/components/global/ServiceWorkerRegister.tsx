"use client";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa";

/** Regista o service worker e procura novas versões sempre que a app volta ao foco. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();

    const checkForUpdate = () => {
      if (document.visibilityState !== "visible") return;
      registerServiceWorker().then((reg) => reg?.update().catch(() => {}));
    };

    document.addEventListener("visibilitychange", checkForUpdate);
    return () => document.removeEventListener("visibilitychange", checkForUpdate);
  }, []);

  return null;
}
