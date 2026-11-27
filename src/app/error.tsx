"use client";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [aTentar, startTransition] = useTransition();

  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  // Erros do servidor chegam com `digest` e, em produção, com a mensagem escondida pelo Next.
  const mensagem = error.digest
    ? "Não foi possível carregar esta página. Verifique a ligação à internet e tente novamente — a sua sessão continua ativa."
    : error.message || "Ocorreu um erro inesperado. Por favor, tente novamente.";

  // refresh() volta a pedir os dados ao servidor; reset() sozinho só re-renderiza no cliente.
  const tentarNovamente = () => startTransition(() => { router.refresh(); reset(); });

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center space-y-4 max-w-md p-8 rounded-xl" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: "var(--danger-bg)" }}>
          <span className="text-2xl" style={{ color: "var(--danger)" }}>!</span>
        </div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
          Algo deu errado
        </h2>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          {mensagem}
        </p>
        <button
          onClick={tentarNovamente}
          disabled={aTentar}
          className="px-4 py-2 min-h-11 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blue)", color: "var(--primary-fg)" }}
        >
          {aTentar ? "A tentar…" : "Tentar novamente"}
        </button>
      </div>
    </div>
  );
}
