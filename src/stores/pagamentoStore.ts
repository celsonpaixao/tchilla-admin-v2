"use client";
import { create } from "zustand";
import type { PagamentoInterface, PagamentoStatus } from "@/types/payment.types";

interface PagamentoFilters {
  estado?: PagamentoStatus | "";
  search?: string;
}

interface PagamentoStore {
  pagamentos: PagamentoInterface[];
  filters: PagamentoFilters;
  selectedPagamento: PagamentoInterface | null;
  isLoading: boolean;

  setPagamentos: (pagamentos: PagamentoInterface[]) => void;
  updatePagamentoEstado: (id: number, estado: PagamentoStatus) => void;
  setFilters: (filters: Partial<PagamentoFilters>) => void;
  setSelectedPagamento: (pagamento: PagamentoInterface | null) => void;
  setLoading: (loading: boolean) => void;
}

export const usePagamentoStore = create<PagamentoStore>((set, get) => ({
  pagamentos: [],
  filters: {},
  selectedPagamento: null,
  isLoading: false,

  setPagamentos: (pagamentos) => set({ pagamentos }),

  updatePagamentoEstado: (id, estado) => {
    const { pagamentos } = get();
    set({
      pagamentos: pagamentos.map((p) =>
        p.id === id ? { ...p, estado } : p
      ),
    });
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  setSelectedPagamento: (pagamento) => set({ selectedPagamento: pagamento }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
