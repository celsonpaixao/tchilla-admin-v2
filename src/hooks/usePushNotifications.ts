"use client";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { registarDispositivo, type UtilizadorPush } from "@/lib/push";

/**
 * Em cada abertura do painel: (re)regista o token deste dispositivo em `fcm_tokens`.
 * O FCM web não avisa quando o token muda, por isso é aqui que um token renovado
 * substitui o anterior. O estado fica em usePushStore (visível em Configurações).
 * A permissão NÃO é pedida aqui — exige um toque (ver ativarNotificacoes / PushAtivarAviso).
 */
export function usePushNotifications(user: UtilizadorPush | null) {
  const userId = user?.id;
  const nome = user?.nome;
  const tipo = user?.tipo;

  useEffect(() => {
    if (!userId) return;
    registarDispositivo({ id: userId, nome: nome ?? "", tipo: tipo ?? "" });
  }, [userId, nome, tipo]);

  // Push com a app aberta: o SW não mostra nada; aqui só se regista (o sino já é atualizado pela Firestore).
  useEffect(() => {
    let parar: (() => void) | undefined;
    getFirebaseMessaging().then((m) => {
      if (m) parar = onMessage(m, (p) => console.log("[FCM] Push recebido em primeiro plano", p.notification?.title));
    }).catch(() => {});
    return () => parar?.();
  }, []);
}
