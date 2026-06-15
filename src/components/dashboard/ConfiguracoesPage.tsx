"use client";
import { useTransition } from "react";
import { LogOut, Shield, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UsuarioInterface } from "@/types/user.types";
import { GlobalAvatar } from "@/components/global/GlobalAvatar";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/utils";

interface ConfiguracoesPageProps {
  user: UsuarioInterface | null;
}

export function ConfiguracoesPage({ user }: ConfiguracoesPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Até logo!");
      router.push(ROUTES.LOGIN);
      router.refresh();
    });
  }

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Configurações</h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>Informações da sua conta</p>
      </div>

      {/* Perfil */}
      <div
        className="rounded-xl p-6 space-y-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-4">
          <GlobalAvatar src={user.foto} name={user.nome} size="xl" />
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>{user.nome}</h2>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1"
              style={{ background: "var(--info-bg)", color: "var(--info-fg)" }}
            >
              <Shield size={11} />
              {user.tipo}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          {[
            { icon: <Mail size={14} />, label: "Email", value: user.email },
            { icon: <Phone size={14} />, label: "Telefone", value: user.telefone },
            { icon: <User size={14} />, label: "ID", value: `#${user.id}` },
            { icon: <Shield size={14} />, label: "Verificado", value: user.verificado ? "Sim" : "Não" },
            { icon: <User size={14} />, label: "Membro desde", value: formatDate(user.dataCriacao) },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span style={{ color: "var(--text-3)" }}>{item.icon}</span>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>{item.label}</p>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info do app */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Sobre o sistema</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Versão", value: "2.0.0 (Next.js)" },
            { label: "Ambiente", value: process.env.NODE_ENV === "production" ? "Produção" : "Homologação" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>{item.label}</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sair */}
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all disabled:opacity-60"
        style={{ background: "var(--danger-bg)", color: "var(--danger-fg)", border: "1px solid var(--danger-bd)" }}
      >
        <LogOut size={15} />
        {isPending ? "Saindo…" : "Sair da conta"}
      </button>
    </div>
  );
}
