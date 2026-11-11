"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro, semVazios } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { ResultadoEscrita } from "@/types/admin.types";
import type { Paginado } from "@/types/payment.types";
import type {
  ContadoresPosts, ContestacaoAdmin, DestaqueAdmin, DestaqueEntrada, FiltroPostsAdmin, PostAdmin,
} from "@/types/publicacao.types";

/* Camada social: moderação das publicações, contestações e destaques da home (/api/Post/admin…). */

async function obter<T>(path: string, filtro: object = {}): Promise<ActionResult<T>> {
  try {
    const res = await serverFetch<ApiResponse<T>>(path, { params: semVazios(filtro) });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

async function enviar<T>(path: string, method: "PUT" | "POST" | "DELETE", body?: object): Promise<ResultadoEscrita<T>> {
  try {
    const res = await serverFetch<ApiResponse<T>>(path, { method, body });
    return { success: true, data: res.data, mensagem: res.message };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

export async function fetchPostsAdmin(filtro: FiltroPostsAdmin = {}) {
  return obter<Paginado<PostAdmin>>("/api/Post/admin", filtro);
}

export async function fetchContadoresPosts() {
  return obter<ContadoresPosts>("/api/Post/admin/contadores");
}

export async function aprovarPost(id: number) {
  return enviar<PostAdmin>(`/api/Post/admin/${id}/aprovar`, "POST");
}

export async function recusarPost(id: number, motivo: string) {
  return enviar<PostAdmin>(`/api/Post/admin/${id}/recusar`, "POST", { motivo });
}

export async function removerPost(id: number, motivo: string) {
  return enviar<PostAdmin>(`/api/Post/admin/${id}/remover`, "POST", { motivo });
}

export async function restaurarPost(id: number) {
  return enviar<PostAdmin>(`/api/Post/admin/${id}/restaurar`, "POST");
}

export async function fetchContestacoes(filtro: { estado?: string; pagina?: number; tamanho?: number } = {}) {
  return obter<Paginado<ContestacaoAdmin>>("/api/Post/admin/contestacoes", filtro);
}

export async function decidirContestacao(id: number, aceitar: boolean, decisao: string) {
  return enviar<{ id: number; estado: string }>(`/api/Post/admin/contestacoes/${id}/decidir`, "POST", { aceitar, decisao });
}

export async function fetchDestaques() {
  return obter<DestaqueAdmin[]>("/api/Post/admin/destaques");
}

export async function criarDestaque(dados: DestaqueEntrada) {
  return enviar<DestaqueAdmin>("/api/Post/admin/destaques", "POST", dados);
}

export async function atualizarDestaque(id: number, dados: DestaqueEntrada) {
  return enviar<DestaqueAdmin>(`/api/Post/admin/destaques/${id}`, "PUT", dados);
}

export async function removerDestaque(id: number) {
  return enviar<{ id: number }>(`/api/Post/admin/destaques/${id}`, "DELETE");
}
