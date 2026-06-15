"use client";
import { create } from "zustand";
import type { UsuarioInterface } from "@/types/user.types";

interface UserStore {
  currentUser: UsuarioInterface | null;
  setCurrentUser: (user: UsuarioInterface) => void;
  clearUser: () => void;
  isSupervisor: () => boolean;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearUser: () => set({ currentUser: null }),
  isSupervisor: () => {
    const tipo = get().currentUser?.tipo?.toLowerCase();
    return tipo === "supervisor";
  },
  isAdmin: () => {
    const tipo = get().currentUser?.tipo?.toLowerCase();
    return tipo === "admin" || tipo === "supervisor";
  },
}));
