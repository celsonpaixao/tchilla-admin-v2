"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeStyle   = "minimal" | "expressive";
export type ThemeDensity = "compact" | "comfy";
export type ThemeDir     = "ltr" | "rtl";

interface ThemeStore {
  style:        ThemeStyle;
  density:      ThemeDensity;
  radiusBase:   number;
  direction:    ThemeDir;
  primaryColor: string;
  accentColor:  string;
  setStyle:     (v: ThemeStyle)   => void;
  setDensity:   (v: ThemeDensity) => void;
  setRadius:    (v: number)       => void;
  setDirection: (v: ThemeDir)     => void;
  setPrimary:   (v: string)       => void;
  setAccent:    (v: string)       => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      style:        "minimal",
      density:      "compact",
      radiusBase:   8,
      direction:    "ltr",
      primaryColor: "#14AAE9",
      accentColor:  "#FF4D8D",
      setStyle:     (style)        => set({ style }),
      setDensity:   (density)      => set({ density }),
      setRadius:    (radiusBase)   => set({ radiusBase }),
      setDirection: (direction)    => set({ direction }),
      setPrimary:   (primaryColor) => set({ primaryColor }),
      setAccent:    (accentColor)  => set({ accentColor }),
    }),
    { name: "tchilla-theme" },
  ),
);
