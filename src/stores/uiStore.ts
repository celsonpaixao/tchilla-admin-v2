"use client";
import { create } from "zustand";

/** Estado de interface partilhado entre a Topbar, a barra inferior e o menu lateral (mobile/tablet). */
interface UiStore {
  menuAberto: boolean;
  abrirMenu: () => void;
  fecharMenu: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  menuAberto: false,
  abrirMenu: () => set({ menuAberto: true }),
  fecharMenu: () => set({ menuAberto: false }),
}));
