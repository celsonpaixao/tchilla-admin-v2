"use client";
import { useEffect, useRef } from "react";
import {
  collection, query, orderBy, limit, onSnapshot, updateDoc, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNotificationStore } from "@/stores/notificationStore";
import { SOUNDS } from "@/constants/app.constants";
import type { FirebaseNotification } from "@/types/notification.types";

const SOUND_MAP: Record<string, string> = {
  reserva: SOUNDS.NOTIFICATION,
  pagamento: SOUNDS.MESSAGE,
  default: SOUNDS.INFO,
};

/**
 * Escuta TODAS as notificações do Firestore (sem filtro de userId).
 * Usado pelo painel admin/supervisor para ver toda a atividade do sistema.
 */
export function useAdminNotifications() {
  const { setNotifications, addNotifiedId, hasBeenNotified } = useNotificationStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playSound(tipo: string) {
    try {
      const src = SOUND_MAP[tipo?.toLowerCase()] ?? SOUND_MAP.default;
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = src;
      audioRef.current.play().catch(() => {});
    } catch {}
  }

  async function markAsReadFirestore(notifId: string) {
    try {
      await updateDoc(doc(db, "notificacoes", notifId), { lida: true });
    } catch {}
  }

  useEffect(() => {
    const q = query(
      collection(db, "notificacoes"),
      orderBy("criadoEm", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: FirebaseNotification[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          userId: raw.userId,
          titulo: raw.titulo,
          mensagem: raw.mensagem,
          tipo: raw.tipo,
          lida: raw.lida ?? false,
          criadoEm: raw.criadoEm,
          deletadoEm: raw.deletadoEm ?? null,
          imagem: raw.imagem ?? null,
          data: raw.data ?? {},
        } satisfies FirebaseNotification;
      });

      setNotifications(notifications, snapshot.docs.length === 50);

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const raw = change.doc.data();
          const id = change.doc.id;
          if (!raw.lida && !hasBeenNotified(id)) {
            addNotifiedId(id);
            playSound(raw.tipo ?? "default");
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);

  return { markAsReadFirestore };
}
