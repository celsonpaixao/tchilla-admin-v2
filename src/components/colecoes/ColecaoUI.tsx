import type { EstadoColecao } from "@/types/colecao.types";
import { Etiqueta } from "@/components/admin/AdminUI";

/** Endereço público da coleção, o mesmo que a app partilha. */
export const LINK_APP = process.env.NEXT_PUBLIC_LINK_APP ?? "https://app.tchilla.com";
export const linkColecao = (slug: string) => `${LINK_APP}/colecao/${slug}`;

const ESTADOS: Record<EstadoColecao, { rotulo: string; tom: "sucesso" | "neutro" | "aviso" }> = {
  publicada: { rotulo: "Publicada", tom: "sucesso" },
  rascunho: { rotulo: "Rascunho", tom: "aviso" },
  arquivada: { rotulo: "Arquivada", tom: "neutro" },
};

export function EstadoColecaoEtiqueta({ estado }: { estado: EstadoColecao }) {
  const e = ESTADOS[estado];
  return <Etiqueta tom={e.tom}>{e.rotulo}</Etiqueta>;
}

export const NOMES_TIPO: Record<string, string> = { servico: "Serviço", espaco: "Espaço", combo: "Combo" };
