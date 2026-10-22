"use client";
import { useCallback, useState } from "react";
import {
  collection, getDocs, orderBy, query, Timestamp, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BudgetRequest } from "@/types/budgetRequest.types";

const COLLECTION = "budget_requests";

export function useBudgetRequests() {
  const [requests, setRequests] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async (inicio: Date, fim: Date) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, COLLECTION),
        where("criadoEm", ">=", Timestamp.fromDate(inicio)),
        where("criadoEm", "<=", Timestamp.fromDate(fim)),
        orderBy("criadoEm", "desc"),
      );
      const snap = await getDocs(q);
      setRequests(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BudgetRequest, "id">) })),
      );
    } catch (err) {
      console.error("Erro ao carregar solicitações de orçamento:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { requests, loading, carregar };
}
