import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center space-y-4">
        <p className="text-6xl font-bold" style={{ color: "var(--blue)" }}>404</p>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>
          Página não encontrada
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
          style={{ background: "var(--blue)" }}
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
