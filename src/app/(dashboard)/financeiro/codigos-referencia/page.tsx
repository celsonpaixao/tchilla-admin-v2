import type { Metadata } from "next";
import { fetchCodigosReferencia, fetchComissoesDoMes } from "@/actions/comissaoReferencia.actions";
import { papelDaSessao } from "@/lib/auth/papel";
import { ComissoesReferenciaPage } from "@/components/pagamentos/ComissoesReferenciaPage";

export const metadata: Metadata = { title: "Financeiro — Códigos de referência" };

type SearchParams = Record<string, string | string[] | undefined>;

function texto(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** Mês atual em Luanda (UTC+1), como AAAA-MM. */
function mesAtual() {
  const agora = new Date(Date.now() + 60 * 60 * 1000);
  return `${agora.getUTCFullYear()}-${String(agora.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function CodigosReferenciaRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const papel = await papelDaSessao();
  const mesPedido = texto(params.mes);
  const mes = mesPedido && /^\d{4}-(0[1-9]|1[0-2])$/.test(mesPedido) ? mesPedido : mesAtual();

  const codigos = await fetchCodigosReferencia();
  const lista = codigos.success ? codigos.data : [];
  const pedido = Number(texto(params.codigo));
  const escolhido = lista.find((c) => c.cupomId === pedido) ?? lista[0];
  const comissoes = escolhido ? await fetchComissoesDoMes(escolhido.cupomId, mes) : null;

  return (
    <ComissoesReferenciaPage
      papel={papel}
      codigos={codigos}
      codigoId={escolhido?.cupomId ?? null}
      mes={mes}
      comissoes={comissoes}
    />
  );
}
