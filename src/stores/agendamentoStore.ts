"use client";
import { create } from "zustand";
import type { ReservaInterface, ReservaStatus } from "@/types/reserva.types";

export type AgendamentoView = "cards" | "calendar" | "table";

interface AgendamentoFilters {
  status?: ReservaStatus | "";
  dataInicio?: string;
  dataFim?: string;
  tipoEvento?: string;
  search?: string;
}

interface AgendamentoStore {
  reservas: ReservaInterface[];
  view: AgendamentoView;
  filters: AgendamentoFilters;
  selectedReserva: ReservaInterface | null;
  isLoading: boolean;

  setReservas: (reservas: ReservaInterface[]) => void;
  updateReservaStatus: (id: number, status: ReservaStatus) => void;
  setView: (view: AgendamentoView) => void;
  setFilters: (filters: Partial<AgendamentoFilters>) => void;
  clearFilters: () => void;
  setSelectedReserva: (reserva: ReservaInterface | null) => void;
  setLoading: (loading: boolean) => void;
  getFilteredReservas: () => ReservaInterface[];
}

export const useAgendamentoStore = create<AgendamentoStore>((set, get) => ({
  reservas: [],
  view: "table",
  filters: {},
  selectedReserva: null,
  isLoading: false,

  setReservas: (reservas) => set({ reservas }),

  updateReservaStatus: (id, status) => {
    const { reservas } = get();
    set({
      reservas: reservas.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    });
  },

  setView: (view) => set({ view }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
  setSelectedReserva: (reserva) => set({ selectedReserva: reserva }),
  setLoading: (loading) => set({ isLoading: loading }),

  getFilteredReservas: () => {
    const { reservas, filters } = get();
    return reservas.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.tipoEvento && r.tipoEvento !== filters.tipoEvento) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          r.cliente.nome.toLowerCase().includes(q) ||
          r.local.toLowerCase().includes(q) ||
          r.tipoEvento.toLowerCase().includes(q) ||
          String(r.id).includes(q);
        if (!matches) return false;
      }
      return true;
    });
  },
}));
