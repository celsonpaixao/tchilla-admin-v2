"use client";
import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useThemeStore } from "@/stores/themeStore";
import { useSupervisorNotifications } from "@/hooks/useSupervisorNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import type { UsuarioInterface } from "@/types/user.types";

interface DashboardProvidersProps {
  children: React.ReactNode;
  user: UsuarioInterface;
}

function NotificationListener({ userId }: { userId: number }) {
  useSupervisorNotifications(userId);
  usePushNotifications(userId);
  return null;
}

const PRIMARIES: Record<string, { fg: string; hover: string; press: string }> = {
  "#14AAE9": { fg: "#0E2A42", hover: "#0F97D0", press: "#0E8FCB" },
  "#0A6F9E": { fg: "#FFFFFF", hover: "#085A82", press: "#0A567A" },
  "#0E2A42": { fg: "#FFFFFF", hover: "#1C3A52", press: "#0A2030" },
};
const ACCENTS: Record<string, { fg: string; bg: string; b100: string }> = {
  "#FF4D8D": { fg: "#C81E5E", bg: "#FFF1F6", b100: "#FFE3EC" },
  "#F25C9C": { fg: "#BC1C68", bg: "#FCE8F1", b100: "#F9D2E2" },
  "#E8638F": { fg: "#AE3A61", bg: "#FBEBF0", b100: "#F4D2DE" },
};

/* Aplica [data-style], [data-density], --radius-base, dir e cores no <html> */
function ThemeApplier() {
  const { style, density, radiusBase, direction, primaryColor, accentColor } = useThemeStore();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-style", style);
    if (density === "comfy") html.setAttribute("data-density", "comfy");
    else html.removeAttribute("data-density");
    html.style.setProperty("--radius-base", `${radiusBase}px`);
    html.setAttribute("dir", direction);

    const p = PRIMARIES[primaryColor] ?? PRIMARIES["#14AAE9"];
    html.style.setProperty("--blue", primaryColor);
    html.style.setProperty("--primary", primaryColor);
    html.style.setProperty("--primary-fg", p.fg);
    html.style.setProperty("--primary-hover", p.hover);
    html.style.setProperty("--primary-press", p.press);

    const a = ACCENTS[accentColor] ?? ACCENTS["#FF4D8D"];
    html.style.setProperty("--pink", accentColor);
    html.style.setProperty("--accent", accentColor);
    html.style.setProperty("--accent-fg", a.fg);
    html.style.setProperty("--accent-bg", a.bg);
    html.style.setProperty("--pink-50", a.bg);
    html.style.setProperty("--pink-100", a.b100);
    html.style.setProperty("--pink-700", a.fg);
  }, [style, density, radiusBase, direction, primaryColor, accentColor]);

  return null;
}

export function DashboardProviders({ children, user }: DashboardProvidersProps) {
  const setCurrentUser = useUserStore((s) => s.setCurrentUser);
  const { setEnums, isLoaded } = useSettingsStore();

  // Popula o store do usuário com dados do servidor
  useEffect(() => {
    setCurrentUser(user);
  }, [user, setCurrentUser]);

  // Carrega os enums da API se ainda não foram carregados
  useEffect(() => {
    if (isLoaded) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Enum/enums`)
      .then((r) => r.json())
      .then((data) => {
        if (data.isSuccess && data.data) setEnums(data.data);
      })
      .catch(() => {});
  }, [isLoaded, setEnums]);

  return (
    <>
      <ThemeApplier />
      <NotificationListener userId={user.id} />
      {children}
    </>
  );
}
