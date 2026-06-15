"use client";
import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useThemeStore } from "@/stores/themeStore";
import { useNotifications } from "@/hooks/useNotifications";
import type { UsuarioInterface } from "@/types/user.types";

interface DashboardProvidersProps {
  children: React.ReactNode;
  user: UsuarioInterface;
}

function NotificationListener({ userId }: { userId: number }) {
  useNotifications(userId);
  return null;
}

/* Aplica [data-style], [data-density], --radius-base e dir no <html> */
function ThemeApplier() {
  const { style, density, radiusBase, direction } = useThemeStore();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-style", style);
    if (density === "comfy") {
      html.setAttribute("data-density", "comfy");
    } else {
      html.removeAttribute("data-density");
    }
    html.style.setProperty("--radius-base", `${radiusBase}px`);
    html.setAttribute("dir", direction);
  }, [style, density, radiusBase, direction]);

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
