"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Email ou senha incorretos.");
          return;
        }

        // Pedir permissão de notificação imediatamente após login
        // O token FCM será registado pelo usePushNotifications no dashboard
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "default") {
            await Notification.requestPermission();
          }
        }

        toast.success("Bem-vindo de volta!");
        router.push(ROUTES.HOME);
        router.refresh();
      } catch {
        setError("Erro de conexão. Verifique sua internet.");
      }
    });
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--navy)" }}>
      {/* Painel esquerdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Formas decorativas */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: "var(--blue)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: "var(--pink)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-5"
          style={{ background: "var(--blue)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/assets/vectores/tchilla-logotipo-branco.svg"
            alt="Tchilla Admin"
            width={140}
            height={40}
            priority
          />
        </div>

        {/* Texto central */}
        <div className="relative z-10 space-y-4">
          <h2
            className="text-4xl font-bold leading-tight"
            style={{ color: "white" }}
          >
            Gestão completa<br />
            em um só lugar
          </h2>
          <p className="text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
            Supervise reservas, gerencie parceiros e acompanhe o crescimento da plataforma Tchilla.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Reservas", value: "12K+" },
            { label: "Parceiros", value: "340+" },
            { label: "Clientes", value: "8K+" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--blue)" }}
              >
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ background: "var(--gray-50)" }}
      >
        <div className="w-full max-w-sm space-y-8">
          {/* Header mobile */}
          <div className="lg:hidden mb-8">
            <Image
              src="/assets/vectores/tchilla-logotipo-marinho.svg"
              alt="Tchilla Admin"
              width={120}
              height={34}
              priority
            />
          </div>

          {/* Título */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Entrar
            </h1>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              Acesso restrito a supervisores e administradores
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium"
                style={{ color: "var(--text-2)" }}
              >
                Email ou usuário
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{
                  background: "var(--surface)",
                  border: error ? "1.5px solid var(--danger)" : "1.5px solid var(--border)",
                  color: "var(--text)",
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = "var(--blue)";
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = "var(--border)";
                }}
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: "var(--text-2)" }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm border outline-none transition-all"
                  style={{
                    background: "var(--surface)",
                    border: error ? "1.5px solid var(--danger)" : "1.5px solid var(--border)",
                    color: "var(--text)",
                  }}
                  onFocus={(e) => {
                    if (!error) e.target.style.borderColor = "var(--blue)";
                  }}
                  onBlur={(e) => {
                    if (!error) e.target.style.borderColor = "var(--border)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  style={{ color: "var(--text-3)" }}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "var(--danger-bg)", color: "var(--danger-fg)" }}
                role="alert"
              >
                <span className="font-medium">!</span>
                {error}
              </div>
            )}

            {/* Botão entrar */}
            <button
              type="submit"
              disabled={isPending || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: isPending ? "var(--primary-press)" : "var(--blue)",
              }}
              onMouseEnter={(e) => {
                if (!isPending) (e.target as HTMLElement).style.background = "var(--primary-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isPending) (e.target as HTMLElement).style.background = "var(--blue)";
              }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs" style={{ color: "var(--text-3)" }}>
            © {new Date().getFullYear()} Tchilla. Acesso restrito.
          </p>
        </div>
      </div>
    </div>
  );
}
