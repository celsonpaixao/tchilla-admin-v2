"use client";
import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { useSettingsStore } from "@/stores/settingsStore";
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
      <NotificationListener userId={user.id} />
      {children}
    </>
  );
}
