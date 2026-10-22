"use client";
import { useCallback, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CampanhaRascunho, CampanhaRascunhoInput } from "@/types/campanha.types";

const COLLECTION = "campanha_rascunhos";
const RASCUNHOS_LIMIT = 30;

/** Chave determinística para deduplicar configs idênticas (mesma audiência + tipo + título + mensagem). */
function buildRascunhoKey(input: CampanhaRascunhoInput): string {
  const raw = `${input.audienceType}|${input.tipo}|${input.titulo.trim().toLowerCase()}|${input.mensagem.trim().toLowerCase()}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  return `r${(hash >>> 0).toString(36)}`;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export function useCampanhaRascunhos() {
  const [rascunhos, setRascunhos] = useState<CampanhaRascunho[]>([]);
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTION), orderBy("atualizadoEm", "desc"), limit(RASCUNHOS_LIMIT));
      const snap = await getDocs(q);
      setRascunhos(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CampanhaRascunho, "id">) })),
      );
    } catch (err) {
      console.error("Erro ao carregar campanhas salvas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const salvar = useCallback(async (input: CampanhaRascunhoInput) => {
    try {
      const key = buildRascunhoKey(input);
      const ref = doc(db, COLLECTION, key);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        await updateDoc(ref, {
          ...stripUndefined(input),
          usageCount: ((snap.data().usageCount as number) ?? 1) + 1,
          atualizadoEm: serverTimestamp(),
        });
      } else {
        await setDoc(ref, {
          ...stripUndefined(input),
          usageCount: 1,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Erro ao salvar rascunho de campanha:", err);
    }
  }, []);

  return { rascunhos, loading, carregar, salvar };
}
