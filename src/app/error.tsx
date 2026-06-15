"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

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
          {error.message || "Ocorreu um erro inesperado. Por favor, tente novamente."}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: "var(--blue)" }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
