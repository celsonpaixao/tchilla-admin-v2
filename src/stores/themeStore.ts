"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeStyle   = "minimal" | "expressive";
export type ThemeDensity = "compact" | "comfy";
export type ThemeDir     = "ltr" | "rtl";

interface ThemeStore {
  style:       ThemeStyle;
  density:     ThemeDensity;
  radiusBase:  number;       // px — 4 | 8 | 12 | 16 | 20
  direction:   ThemeDir;
  setStyle:    (v: ThemeStyle)   => void;
  setDensity:  (v: ThemeDensity) => void;
  setRadius:   (v: number)       => void;
  setDirection:(v: ThemeDir)     => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      style:      "minimal",
      density:    "compact",
      radiusBase: 8,
      direction:  "ltr",
      setStyle:    (style)     => set({ style }),
      setDensity:  (density)   => set({ density }),
      setRadius:   (radiusBase)=> set({ radiusBase }),
      setDirection:(direction) => set({ direction }),
    }),
    { name: "tchilla-theme" },
  ),
);
