"use client";
import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import {
  collection, query, where, getDocs,
  addDoc, updateDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db, getFirebaseMessaging } from "@/lib/firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY!;

export function usePushNotifications(userId: number) {
  useEffect(() => {
    if (!userId) return;

    async function register() {
      const log = (msg: string, data?: unknown) =>
        console.log(`%c[FCM] ${msg}`, "color:#14AAE9;font-weight:600", data ?? "");

      try {
        log("🚀 Iniciando registo de token FCM...", { userId });

        // 1. Verificar suporte
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
          log("⚠️ Firebase Messaging não suportado neste browser");
          return;
        }
        log("✅ Firebase Messaging suportado");

        // 2. Verificar permissão
        log(`🔔 Permissão de notificação: ${Notification.permission}`);
        if (Notification.permission !== "granted") {
          log("⛔ Permissão não concedida — a sair");
          return;
        }

        // 3. Registar o Service Worker explicitamente (necessário no Next.js)
        log("⚙️ A registar Service Worker...");
        let swRegistration: ServiceWorkerRegistration;
        try {
          swRegistration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
            { scope: "/" }
          );
          await navigator.serviceWorker.ready;
          log("✅ Service Worker registado", swRegistration.scope);
        } catch (swErr) {
          log("❌ Falha ao registar Service Worker", swErr);
          return;
        }

        // 4. Cancelar subscrição push existente (pode ter VAPID key diferente)
        const existingSub = await swRegistration.pushManager.getSubscription();
        if (existingSub) {
          log("🔄 Subscrição push existente encontrada — a cancelar para garantir chave correcta...");
          await existingSub.unsubscribe();
          log("✅ Subscrição cancelada");
        } else {
          log("ℹ️ Nenhuma subscrição push anterior");
        }

        // 5. Obter token FCM passando o SW registado
        log("⏳ A obter token FCM do Firebase...");
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });
        if (!token) {
          log("❌ Não foi possível obter o token FCM (VAPID key inválida?)");
          return;
        }
        log("🔑 Token FCM obtido", `${token.substring(0, 30)}...`);

        // 6. Verificar token activo no Firestore
        log("🔍 A verificar se o token já existe e está activo no Firestore...");
        const activeSnap = await getDocs(
          query(
            collection(db, "fcm_tokens"),
            where("userId", "==", userId),
            where("token", "==", token),
            where("isActive", "==", true)
          )
        );

        if (!activeSnap.empty) {
          log("✅ Token já registado e activo — nenhuma acção necessária");
          return;
        }

        // 7. Verificar token inactivo
        log("🔍 Token não activo — a verificar se existe mas inactivo...");
        const inactiveSnap = await getDocs(
          query(
            collection(db, "fcm_tokens"),
            where("userId", "==", userId),
            where("token", "==", token)
          )
        );

        if (!inactiveSnap.empty) {
          log("♻️ Token encontrado inactivo — a reactivar...");
          inactiveSnap.forEach((d) => {
            updateDoc(doc(db, "fcm_tokens", d.id), {
              isActive: true,
              invalidReason: null,
              updatedAt: serverTimestamp(),
            });
          });
          log("✅ Token reactivado com sucesso");
          return;
        }

        // 8. Token novo — limpar antigos e criar
        log("🆕 Token novo detectado — a verificar tokens web antigos...");
        const oldWebSnap = await getDocs(
          query(
            collection(db, "fcm_tokens"),
            where("userId", "==", userId),
            where("deviceType", "==", "web"),
            where("isActive", "==", true)
          )
        );

        if (!oldWebSnap.empty) {
          log(`🗑️ A desactivar ${oldWebSnap.size} token(s) web antigo(s)...`);
          oldWebSnap.forEach((d) => {
            updateDoc(doc(db, "fcm_tokens", d.id), {
              isActive: false,
              updatedAt: serverTimestamp(),
            });
          });
        }

        log("💾 A guardar novo token no Firestore...");
        const docRef = await addDoc(collection(db, "fcm_tokens"), {
          userId,
          token,
          isActive: true,
          deviceType: "web",
          deviceId: `web-${userId}`,
          deviceName: navigator.userAgent.substring(0, 80),
          deviceInfo: {
            browser: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
          appVersion: "admin-web",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        log("✅ Token guardado com sucesso!", { docId: docRef.id });

        // 9. Listener de foreground
        onMessage(messaging, (payload) => {
          log("📨 Push recebido em foreground", payload.notification?.title);
        });

        log("🎉 Registo FCM completo — pronto para receber push notifications");

      } catch (err) {
        console.error("[FCM] ❌ Erro no registo:", err);
      }
    }

    register();
  }, [userId]);
}
