import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageShell } from "@/components/global/PageShell";

/** Página de detalhe que não carregou: diz porquê e oferece o caminho de volta. */
export function ErroDetalhe({ titulo, mensagem, voltar }: { titulo: string; mensagem: string; voltar: { label: string; href: string } }) {
  return (
    <PageShell title={titulo}>
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", color: "var(--danger-fg)" }}
      >
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">Não foi possível abrir</p>
          <p>{mensagem}</p>
        </div>
        <Link href={voltar.href} className="text-sm font-semibold underline">{voltar.label}</Link>
      </div>
    </PageShell>
  );
}
