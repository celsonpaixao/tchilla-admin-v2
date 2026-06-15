"use client";
import { create } from "zustand";
import type { SettingsAppEnum } from "@/types/settings.types";

interface SettingsStore {
  enums: SettingsAppEnum[];
  isLoaded: boolean;
  setEnums: (enums: SettingsAppEnum[]) => void;
  getEnum: (name: string) => string[];
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  enums: [],
  isLoaded: false,

  setEnums: (enums) => set({ enums, isLoaded: true }),

  getEnum: (name) => {
    const found = get().enums.find((e) => e.name === name);
    return found?.values ?? [];
  },
}));
