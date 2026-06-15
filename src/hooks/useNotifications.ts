"use client";
import { useEffect, useRef } from "react";
import {
  collection, query, where, orderBy, onSnapshot, updateDoc, doc,
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

export function useNotifications(userId?: number) {
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
      await updateDoc(doc(db, "notificacoes", notifId), { "data.lida": true });
    } catch {}
  }

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "notificacoes"),
      where("data.userId", "==", userId),
      orderBy("criadoEm", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: FirebaseNotification[] = snapshot.docs.map((d) => ({
        id: d.id,
        criadoEm: d.data().criadoEm,
        data: d.data().data,
      }));

      setNotifications(notifications);

      // Tocar som apenas para notificações novas não lidas
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const id = change.doc.id;
          if (!data.data?.lida && !hasBeenNotified(id)) {
            addNotifiedId(id);
            playSound(data.data?.tipo ?? "default");
          }
        }
      });
    });

    return () => unsubscribe();
  }, [userId]);

  return { markAsReadFirestore };
}
