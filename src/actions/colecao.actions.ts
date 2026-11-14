"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { ResultadoEscrita, UsuarioAdmin } from "@/types/admin.types";
import type { Paginado } from "@/types/payment.types";
import type { ColecaoAdmin, ColecaoEntrada, ColecaoItem } from "@/types/colecao.types";

/* Coleções públicas da equipa (ex.: "Casamento E&C"): /api/Colecao/admin… */

async function obter<T>(path: string, params?: Record<string, string>): Promise<ActionResult<T>> {
  try {
    const res = await serverFetch<ApiResponse<T>>(path, { params });
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

export async function fetchColecoes() {
  return obter<ColecaoAdmin[]>("/api/Colecao/admin");
}

export async function fetchColecao(id: number) {
  return obter<ColecaoAdmin>(`/api/Colecao/admin/${id}`);
}

export async function criarColecao(dados: ColecaoEntrada) {
  return enviar<ColecaoAdmin>("/api/Colecao/admin", "POST", dados);
}

export async function atualizarColecao(id: number, dados: ColecaoEntrada) {
  return enviar<ColecaoAdmin>(`/api/Colecao/admin/${id}`, "PUT", dados);
}

export async function apagarColecao(id: number) {
  return enviar<{ id: number }>(`/api/Colecao/admin/${id}`, "DELETE");
}

/** Serviços, espaços e combos pelo nome do anúncio ou do parceiro (2+ letras). */
export async function pesquisarAnunciosColecao(pesquisa: string) {
  return obter<ColecaoItem[]>("/api/Colecao/admin/anuncios", { pesquisa });
}

/** Contas de clientes, para escolher o dono da coleção (o casal). */
export async function pesquisarClientesColecao(pesquisa: string) {
  return obter<Paginado<UsuarioAdmin>>("/api/Usuario/admin", { pesquisa, tipo: "cliente", estado: "ativos", pageSize: "8" });
}
