"use client";
import { create } from "zustand";

interface AuthStore {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

// Token está no cookie HttpOnly — sem localStorage
export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));
