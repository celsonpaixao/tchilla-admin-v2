"use client";
import { useEffect, useRef } from "react";
import {
  collection, query, where, orderBy, limit, startAfter,
  onSnapshot, getDocs, type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNotificationStore } from "@/stores/notificationStore";
import { SOUNDS } from "@/constants/app.constants";
import type { FirebaseNotification } from "@/types/notification.types";

const PAGE_SIZE = 20;

function mapDoc(d: QueryDocumentSnapshot): FirebaseNotification {
  const raw = d.data();
  return {
    id: d.id,
    userId: raw.userId,
    titulo: raw.titulo ?? "",
    mensagem: raw.mensagem ?? "",
    tipo: raw.tipo ?? "",
    lida: raw.lida ?? false,
    criadoEm: raw.criadoEm,
    deletadoEm: raw.deletadoEm ?? null,
    imagem: raw.imagem ?? null,
    data: raw.data ?? {},
  };
}

export function useSupervisorNotifications(userId: number) {
  const {
    setNotifications,
    appendNotifications,
    setHasMore,
    setIsLoadingMore,
    registerLoadMore,
    addNotifiedId,
    hasBeenNotified,
  } = useNotificationStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);

  function playSound(tipo: string) {
    try {
      const key = tipo?.toLowerCase();
      const src = key?.includes("reserva")
        ? SOUNDS.NOTIFICATION
        : key?.includes("pagamento") || key?.includes("chat")
        ? SOUNDS.MESSAGE
        : SOUNDS.INFO;
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = src;
      audioRef.current.play().catch(() => {});
    } catch {}
  }

  useEffect(() => {
    const q = query(
      collection(db, "notificacoes"),
      where("userId", "==", userId),
      orderBy("criadoEm", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(mapDoc);
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] ?? null;
      setNotifications(notifications, snapshot.docs.length === PAGE_SIZE);

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const raw = change.doc.data();
          const id = change.doc.id;
          if (!raw.lida && !hasBeenNotified(id)) {
            addNotifiedId(id);
            playSound(raw.tipo ?? "");
          }
        }
      });
    });

    return () => unsubscribe();
  }, [userId]);

  // Registar o loadMore no store para que o Topbar possa chamá-lo
  useEffect(() => {
    async function loadMore() {
      if (!lastDocRef.current) return;
      setIsLoadingMore(true);
      try {
        const q = query(
          collection(db, "notificacoes"),
          where("userId", "==", userId),
          orderBy("criadoEm", "desc"),
          startAfter(lastDocRef.current),
          limit(PAGE_SIZE)
        );
        const snapshot = await getDocs(q);
        if (snapshot.docs.length > 0) {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }
        appendNotifications(snapshot.docs.map(mapDoc), snapshot.docs.length === PAGE_SIZE);
      } catch {}
      setIsLoadingMore(false);
    }

    registerLoadMore(loadMore);
    return () => registerLoadMore(null);
  }, [userId]);
}
