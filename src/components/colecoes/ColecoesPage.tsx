"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ActionResult } from "@/types/common.types";
import type { ColecaoAdmin } from "@/types/colecao.types";
import { PageShell } from "@/components/global/PageShell";
import { GlobalButton } from "@/components/global/GlobalButton";
import { ErroCarregamento } from "@/components/global/FiltrosUI";
import { DataCurta, Vazio } from "@/components/admin/AdminUI";
import { Miniatura } from "@/components/publicacoes/PostUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { ROUTES } from "@/constants/routes";
import { EstadoColecaoEtiqueta } from "./ColecaoUI";

/*
 * Coleções: páginas públicas com os fornecedores de um evento real (ex.: "Casamento E&C").
 * Na app, cada anúncio abre a sua página e contrata-se à parte, com o seu prestador.
 */
export function ColecoesPage({ colecoes }: { colecoes: ActionResult<ColecaoAdmin[]> }) {
  const { recarregar } = useFiltrosUrl();

  return (
    <PageShell
      title="Coleções"
      subtitle="Páginas na app com os fornecedores de um evento real. Cada anúncio contrata-se à parte, com o seu prestador: não é um combo."
      actions={
        <Link href={ROUTES.GESTAO.COLECAO("nova")}>
          <GlobalButton variant="accent" leftIcon={<Plus size={16} />}>Nova coleção</GlobalButton>
        </Link>
      }
    >
      {!colecoes.success ? (
        <ErroCarregamento mensagem={colecoes.error} onRetry={recarregar} />
      ) : colecoes.data.length === 0 ? (
        <div className="rounded-lg p-6" style={{ border: "1px solid var(--border)", background: "var(--surface, #fff)" }}>
          <Vazio mensagem="Ainda não há coleções. Cria a primeira com os fornecedores de um evento, por exemplo o Casamento E&C." />
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {colecoes.data.map((c) => (
            <li key={c.id}>
              <Link
                href={ROUTES.GESTAO.COLECAO(c.id)}
                className="grid gap-3 p-3 rounded-lg grid-cols-[auto_minmax(0,1fr)] items-center hover:shadow-sm"
                style={{ border: "1px solid var(--border)", background: "var(--surface, #fff)" }}
              >
                <Miniatura url={c.capa} tamanho={64} rotulo="Capa" />
                <div className="min-w-0 flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <EstadoColecaoEtiqueta estado={c.estado} />
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{c.titulo}</span>
                  </div>
                  <p className="text-sm truncate" style={{ color: c.subtitulo ? "var(--text-2)" : "var(--text-3)" }}>{c.subtitulo || "Sem subtítulo"}</p>
                  <p className="text-xs flex flex-wrap gap-x-3" style={{ color: "var(--text-3)" }}>
                    <span>{c.totalItens} {c.totalItens === 1 ? "anúncio" : "anúncios"}</span>
                    {c.usuarioNome && <span>Dono: {c.usuarioNome}</span>}
                    <span>/colecao/{c.slug}</span>
                    {c.publicadaEm && <span>Publicada em <DataCurta valor={c.publicadaEm} /></span>}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
