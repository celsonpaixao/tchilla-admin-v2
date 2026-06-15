import { Loader2 } from "lucide-react";

export function GlobalLoading({ message = "Carregando…" }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(14,42,66,0.15)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="flex flex-col items-center gap-3 px-8 py-6 rounded-xl"
        style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
      >
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--blue)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{message}</p>
      </div>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex-1 flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4"
          style={{ width: i === 0 ? "60%" : i === lines - 1 ? "40%" : "80%" }}
        />
      ))}
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-9 w-9 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-32" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}
