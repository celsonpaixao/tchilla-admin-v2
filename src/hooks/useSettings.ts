"use client";
import { useSettingsStore } from "@/stores/settingsStore";

export function useSettings() {
  const { enums, isLoaded, getEnum } = useSettingsStore();

  return {
    enums,
    isLoaded,
    tiposEvento: getEnum("TipoEvento"),
    statusReserva: getEnum("StatusReserva"),
    getEnum,
  };
}
