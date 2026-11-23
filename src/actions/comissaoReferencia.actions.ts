"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro as mensagemDe } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { CodigoReferenciaInterface, ComissoesDoMes } from "@/types/comissaoReferencia.types";

/** Códigos de referência (cupões ligados a uma coleção, com percentagem). Só Admin. */
export async function fetchCodigosReferencia(): Promise<ActionResult<CodigoReferenciaInterface[]>> {
  try {
    const res = await serverFetch<ApiResponse<CodigoReferenciaInterface[]>>("/api/ComissaoReferencia/codigos");
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDe(err) };
  }
}

/** Comissões de um mês (AAAA-MM). O back-end junta primeiro as reservas pagas que faltam. */
export async function fetchComissoesDoMes(cupomId: number, mes: string): Promise<ActionResult<ComissoesDoMes>> {
  try {
    const res = await serverFetch<ApiResponse<ComissoesDoMes>>(`/api/ComissaoReferencia/${cupomId}`, {
      params: { mes },
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDe(err) };
  }
}

/** Marca linhas como pagas ao beneficiário, com a referência da transferência. */
export async function marcarComissoesPagas(
  ids: number[],
  referencia: string,
  pagoEm?: string,
): Promise<ActionResult<number>> {
  try {
    const res = await serverFetch<ApiResponse<number>>("/api/ComissaoReferencia/pagar", {
      method: "PUT",
      body: { ids, referencia, pagoEm: pagoEm || undefined },
    });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDe(err) };
  }
}
