import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FCM } from "@/constants/app.constants";
import type { FcmDeviceInfo, FcmTokenDoc } from "@/types/fcm.types";

/**
 * Registo dos tokens de push em `fcm_tokens` — o mesmo padrão do app-user e do app do
 * parceiro: um documento por (utilizador, dispositivo, app), reativado/atualizado em vez
 * de duplicado. No logout desativa-se só o token deste dispositivo.
 */

const tokens = () => collection(db, FCM.COLLECTION);

const doAdmin = (d: QueryDocumentSnapshot) => d.data().app === FCM.APP;

/** Id estável deste browser (sobrevive a logouts; muda só se o localStorage for limpo). */
export function obterDeviceId(): string {
  let id = localStorage.getItem(FCM.DEVICE_ID_KEY);
  if (!id) {
    const aleatorio =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    id = `admin-web-${aleatorio}`;
    localStorage.setItem(FCM.DEVICE_ID_KEY, id);
  }
  return id;
}

export function infoDoDispositivo(): FcmDeviceInfo {
  const ua = navigator.userAgent;

  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\//.test(ua) ? "Opera"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : "Browser";

  const os =
    /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS X/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux"
    : "Desconhecido";

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return {
    deviceName: `${browser} · ${os}${standalone ? " (app)" : ""}`,
    osVersion: os,
    browser,
    language: navigator.language,
    userAgent: ua.substring(0, 300),
    standalone,
    mobile: /Mobi|Android|iPhone|iPad/.test(ua),
  };
}

const appVersion = () => `admin-web ${process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}`;

interface RegistarTokenParams {
  userId: number;
  token: string;
  nome?: string | null;
  role?: string | null;
}

/** Grava ou reativa o token deste dispositivo. Devolve o id do documento. */
export async function registarTokenFcm({ userId, token, nome, role }: RegistarTokenParams): Promise<string> {
  const deviceId = obterDeviceId();
  const deviceInfo = infoDoDispositivo();
  const nomeLimpo = nome?.trim() || undefined;

  const campos = {
    token,
    isActive: true,
    invalidReason: null,
    deviceName: deviceInfo.deviceName,
    deviceInfo,
    appVersion: appVersion(),
    plataforma: FCM.PLATAFORMA,
    app: FCM.APP,
    role: role?.trim() || FCM.ROLE_PADRAO,
    ...(nomeLimpo && { nome: nomeLimpo }),
    updatedAt: serverTimestamp(),
  } satisfies Partial<FcmTokenDoc>;

  const existentes = await getDocs(
    query(tokens(), where("userId", "==", userId), where("deviceId", "==", deviceId))
  );
  const proprio = existentes.docs.find(doAdmin);

  let docId: string;
  if (proprio) {
    await updateDoc(proprio.ref, campos);
    docId = proprio.id;
  } else {
    const novo: FcmTokenDoc = {
      ...campos,
      userId,
      deviceId,
      deviceType: "web",
      createdAt: serverTimestamp(),
    };
    docId = (await addDoc(tokens(), novo)).id;
  }

  await desativarRegistosAntigos(userId, token, docId);
  return docId;
}

/**
 * Remove o que faria a push chegar em duplicado ou à pessoa errada:
 *  - o mesmo token noutro documento ativo;
 *  - o registo antigo do painel (deviceId "web-<userId>", sem `app` nem `role`), que as
 *    functions deixavam passar em pushes de cliente/parceiro com o mesmo id.
 * Os outros browsers do utilizador voltam a registar-se no novo formato ao abrir o painel.
 */
async function desativarRegistosAntigos(userId: number, token: string, docAtual: string) {
  const [mesmoToken, legado] = await Promise.all([
    getDocs(query(tokens(), where("token", "==", token), where("isActive", "==", true))),
    getDocs(
      query(
        tokens(),
        where("userId", "==", userId),
        where("deviceId", "==", `web-${userId}`),
        where("isActive", "==", true)
      )
    ),
  ]);

  const aDesativar = new Map<string, QueryDocumentSnapshot>();
  mesmoToken.docs.forEach((d) => aDesativar.set(d.id, d));
  legado.docs.filter((d) => !d.data().app).forEach((d) => aDesativar.set(d.id, d));
  aDesativar.delete(docAtual);

  await Promise.all(
    [...aDesativar.values()].map((d) =>
      updateDoc(d.ref, { isActive: false, invalidReason: "substituido", updatedAt: serverTimestamp() })
    )
  );
}

/**
 * Logout: desativa só o token deste dispositivo (os outros dispositivos do utilizador
 * continuam a receber pushes). Nunca bloqueia o logout: desiste ao fim de `timeoutMs`.
 */
export async function desativarTokenDoDispositivo(userId: number, timeoutMs = 3000): Promise<void> {
  const deviceId = localStorage.getItem(FCM.DEVICE_ID_KEY);
  if (!deviceId) return;

  const desativar = async () => {
    const snap = await getDocs(
      query(
        tokens(),
        where("userId", "==", userId),
        where("deviceId", "==", deviceId),
        where("isActive", "==", true)
      )
    );
    await Promise.all(
      snap.docs
        .filter(doAdmin)
        .map((d) => updateDoc(d.ref, { isActive: false, updatedAt: serverTimestamp() }))
    );
  };

  try {
    await Promise.race([desativar(), new Promise((r) => setTimeout(r, timeoutMs))]);
  } catch (err) {
    console.error("[FCM] Erro ao desativar o token do dispositivo", err);
  }
}
