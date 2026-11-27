"use client";
import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { registerServiceWorker } from "@/lib/pwa";
import { registarTokenFcm } from "@/lib/fcm-tokens";
import type { UsuarioInterface } from "@/types/user.types";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY!;

const log = (msg: string, data?: unknown) =>
  console.log(`%c[FCM] ${msg}`, "color:#14AAE9;font-weight:600", data ?? "");

/** A chave VAPID da subscrição atual é a que a app usa agora? */
function usaChaveAtual(sub: PushSubscription): boolean {
  const atual = sub.options.applicationServerKey;
  if (!atual) return false;
  const base64 = VAPID_KEY.replace(/-/g, "+").replace(/_/g, "/");
  const esperada = Uint8Array.from(atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4)), (c) =>
    c.charCodeAt(0)
  );
  const bytes = new Uint8Array(atual);
  return bytes.length === esperada.length && bytes.every((b, i) => b === esperada[i]);
}

type Utilizador = Pick<UsuarioInterface, "id" | "nome" | "tipo">;

/**
 * Obtém o token FCM deste browser e regista-o em `fcm_tokens` (ver lib/fcm-tokens.ts).
 * Corre em cada abertura do painel: o FCM web não avisa quando o token muda, por isso é
 * aqui que um token renovado substitui o anterior.
 */
export function usePushNotifications(user: Utilizador | null) {
  const userId = user?.id;
  const nome = user?.nome;
  const role = user?.tipo;

  useEffect(() => {
    if (!userId) return;
    let cancelado = false;
    let pararForeground: (() => void) | undefined;

    async function registar() {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return log("Firebase Messaging não suportado neste browser");

        if (Notification.permission !== "granted") {
          return log(`Permissão de notificação: ${Notification.permission} — sem registo`);
        }

        if (!(await registerServiceWorker())) return log("Falha ao registar o Service Worker");
        const swRegistration = await navigator.serviceWorker.ready;

        // Só se cancela a subscrição se foi criada com outra chave VAPID; cancelar
        // sempre obrigava o Firebase a emitir um token novo em cada abertura.
        const sub = await swRegistration.pushManager.getSubscription();
        if (sub && !usaChaveAtual(sub)) {
          log("Subscrição com outra chave VAPID — a renovar");
          await sub.unsubscribe();
        }

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });
        if (!token) return log("Não foi possível obter o token FCM (VAPID key inválida?)");
        if (cancelado) return;

        const docId = await registarTokenFcm({ userId: userId!, token, nome, role });
        log("Token registado", { docId, token: `${token.substring(0, 20)}…` });

        pararForeground = onMessage(messaging, (payload) => {
          log("Push recebido em foreground", payload.notification?.title);
        });
      } catch (err) {
        console.error("[FCM] Erro no registo:", err);
      }
    }

    registar();
    return () => {
      cancelado = true;
      pararForeground?.();
    };
  }, [userId, nome, role]);
}
