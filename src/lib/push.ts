"use client";
import { getToken, isSupported, getMessaging } from "firebase/messaging";
import { doc, getDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
import { db } from "@/lib/firebase";
import { registerServiceWorker } from "@/lib/pwa";
import { registarTokenFcm } from "@/lib/fcm-tokens";
import { FCM } from "@/constants/app.constants";
import { usePushStore } from "@/stores/pushStore";
import type { UsuarioInterface } from "@/types/user.types";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY ?? "";
const PROJETO = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? null;

export type UtilizadorPush = Pick<UsuarioInterface, "id" | "nome" | "tipo">;

const estado = () => usePushStore.getState();

const log = (msg: string, data?: unknown) =>
  console.log(`%c[FCM] ${msg}`, "color:#14AAE9;font-weight:600", data ?? "");

function ehIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function ehPwaInstalada() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Porque é que este dispositivo não suporta push (ou null se suporta). */
async function motivoSemSuporte(): Promise<string | null> {
  if (!("serviceWorker" in navigator) || !("Notification" in window) || !("PushManager" in window)) {
    if (ehIOS() && !ehPwaInstalada()) {
      return "No iPhone/iPad, as notificações só funcionam com o painel instalado no ecrã principal (Partilhar → Adicionar ao ecrã principal) e iOS 16.4 ou mais recente.";
    }
    return "Este browser não suporta notificações push.";
  }
  if (!(await isSupported().catch(() => false))) {
    return "O Firebase Messaging não é suportado neste browser.";
  }
  if (!VAPID_KEY) return "Falta a chave VAPID (NEXT_PUBLIC_VAPID_KEY) nesta versão do painel.";
  return null;
}

/** Erros conhecidos → explicação em português (o código técnico fica à parte). */
function explicarErro(err: unknown): { detalhe: string; codigo: string } {
  const e = err as { code?: string; name?: string; message?: string };
  const codigo = e?.code ?? e?.name ?? "erro";
  const msg = e?.message ?? String(err);
  if (codigo === "permission-denied" || /insufficient permissions/i.test(msg)) {
    return { codigo, detalhe: `A Firestore do projeto "${PROJETO}" recusou a escrita em "${FCM.COLLECTION}" (regras de segurança).` };
  }
  if (codigo.startsWith("messaging/token-subscribe") || /push service error|Registration failed/i.test(msg)) {
    return { codigo, detalhe: "O serviço de push do sistema recusou a subscrição. Feche e volte a abrir a app e tente de novo." };
  }
  if (codigo === "messaging/permission-blocked") {
    return { codigo, detalhe: "As notificações estão bloqueadas para este site/app." };
  }
  if (codigo === "unavailable" || /offline|network/i.test(msg)) {
    return { codigo, detalhe: "Sem ligação à Firestore. Verifique a internet e tente de novo." };
  }
  return { codigo, detalhe: msg };
}

/** O iOS falha às vezes o 1.º pedido de subscrição; uma 2.ª tentativa costuma resolver. */
async function obterToken(swRegistration: ServiceWorkerRegistration): Promise<string> {
  const messaging = getMessaging(getApp());
  try {
    return await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swRegistration });
  } catch (err) {
    log("1.ª tentativa de getToken falhou — a repetir", err);
    await new Promise((r) => setTimeout(r, 1500));
    return await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swRegistration });
  }
}

/** A chave VAPID da subscrição atual é a que a app usa agora? */
function usaChaveAtual(sub: PushSubscription): boolean {
  const atual = sub.options.applicationServerKey;
  if (!atual) return false;
  const base64 = VAPID_KEY.replace(/-/g, "+").replace(/_/g, "/");
  const esperada = Uint8Array.from(atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4)), (c) => c.charCodeAt(0));
  const bytes = new Uint8Array(atual);
  return bytes.length === esperada.length && bytes.every((b, i) => b === esperada[i]);
}

/**
 * Obtém o token deste dispositivo e grava-o em `fcm_tokens`, confirmando a escrita com uma
 * leitura. Não pede permissão (isso exige um toque — ver `ativarNotificacoes`).
 */
export async function registarDispositivo(user: UtilizadorPush): Promise<void> {
  const { atualizar } = estado();
  atualizar({ etapa: "a-verificar", detalhe: null, codigo: null });

  const semSuporte = await motivoSemSuporte();
  if (semSuporte) return atualizar({ etapa: "sem-suporte", detalhe: semSuporte });

  if (Notification.permission === "default") {
    return atualizar({ etapa: "por-ativar", detalhe: "Toque em “Ativar notificações” para receber avisos de novas reservas neste dispositivo." });
  }
  if (Notification.permission === "denied") {
    return atualizar({
      etapa: "bloqueado",
      detalhe: ehIOS()
        ? "Bloqueadas. Ative em Definições → Notificações → Tchilla Admin."
        : "Bloqueadas. Ative nas definições do site (cadeado ao lado do endereço) ou nas definições da app.",
    });
  }

  atualizar({ etapa: "a-registar" });
  try {
    const sw = await registerServiceWorker();
    if (!sw) throw Object.assign(new Error("Não foi possível registar o service worker."), { code: "service-worker" });
    const swRegistration = await navigator.serviceWorker.ready;

    const sub = await swRegistration.pushManager.getSubscription();
    if (sub && !usaChaveAtual(sub)) {
      log("Subscrição com outra chave VAPID — a renovar");
      await sub.unsubscribe();
    }

    const token = await obterToken(swRegistration);
    if (!token) throw Object.assign(new Error("O Firebase não devolveu token (chave VAPID inválida?)."), { code: "sem-token" });
    log("Token obtido", `${token.slice(0, 20)}…`);

    const docId = await registarTokenFcm({ userId: user.id, token, nome: user.nome, role: user.tipo });

    // Confirma que ficou mesmo gravado (e ativo) — é isto que o ecrã de diagnóstico mostra.
    const gravado = await getDoc(doc(db, FCM.COLLECTION, docId));
    if (!gravado.exists() || gravado.data().token !== token || gravado.data().isActive !== true) {
      throw Object.assign(new Error("O documento não ficou gravado como esperado na Firestore."), { code: "verificacao" });
    }

    atualizar({ etapa: "registado", token, docId, projeto: PROJETO, registadoEm: Date.now(), detalhe: null, codigo: null });
    log("Token registado na Firestore", { projeto: PROJETO, docId });
  } catch (err) {
    console.error("[FCM] Erro no registo:", err);
    atualizar({ etapa: "erro", ...explicarErro(err) });
  }
}

/**
 * Pede a permissão e regista. TEM de ser chamada diretamente num clique/toque: o iOS (e o
 * Chrome) só mostram o pedido de permissão com um gesto do utilizador — por isso o pedido
 * que se fazia depois do login (após vários `await`) nunca aparecia no iPhone.
 */
export async function ativarNotificacoes(user: UtilizadorPush): Promise<void> {
  if (!("Notification" in window)) return registarDispositivo(user);
  // 1.ª instrução do handler, antes de qualquer await: mantém o gesto do utilizador.
  const pedido = Notification.requestPermission();
  await pedido;
  await registarDispositivo(user);
}

/** Mostra uma notificação local pelo service worker — confirma permissão + SW + apresentação. */
export async function notificacaoDeTeste(): Promise<void> {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification("Tchilla Admin — teste", {
    body: "As notificações estão a funcionar neste dispositivo.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "tchilla-teste",
  });
}
