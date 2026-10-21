"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type {
  PromocaoCatalogos,
  PromocaoDetalhe,
  PromocaoResumo,
  SalvarPromocao,
} from "@/types/promotion.types";

interface LocalCatalogoItem {
  id: number;
  nome: string;
  descricao?: string | null;
  precoHora: number;
  imagemCapa?: string | null;
  status: number;
}

interface PagedLocalCatalogo {
  items?: LocalCatalogoItem[];
}

interface ServicoCatalogoItem {
  id: number;
  nome: string;
  descricao?: string | null;
  precoBase: number;
  imagens?: string[];
  responsavel?: { nome?: string | null } | null;
}

export async function fetchPromocoes(): Promise<ActionResult<PromocaoResumo[]>> {
  try {
    const response = await serverFetch<ApiResponse<PromocaoResumo[]>>(
      "/api/Promocao/admin/todas"
    );
    return { success: true, data: response.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchPromocaoCatalogos(): Promise<ActionResult<PromocaoCatalogos>> {
  try {
    const [locaisResponse, servicosResponse] = await Promise.all([
      serverFetch<ApiResponse<PagedLocalCatalogo>>("/api/Local", {
        params: { status: 2, page: 1, pageSize: 1000 },
      }),
      serverFetch<ApiResponse<ServicoCatalogoItem[]>>("/api/Servico/getAll"),
    ]);

    const espacos = (locaisResponse.data?.items ?? []).map((local) => ({
      id: local.id,
      nome: local.nome,
      descricao: local.descricao,
      preco: local.precoHora,
      imagem: local.imagemCapa,
      contratavel: true,
      status: local.status,
    }));
    const servicos = (servicosResponse.data ?? []).map((servico) => ({
      id: servico.id,
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.precoBase,
      imagem: servico.imagens?.[0],
      contratavel: servico.responsavel?.nome !== "Tchilla",
    }));

    return { success: true, data: { espacos, servicos } };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchPromocaoDetalhe(id: number): Promise<ActionResult<PromocaoDetalhe>> {
  try {
    const response = await serverFetch<ApiResponse<PromocaoDetalhe>>(
      `/api/Promocao/admin/${id}`
    );
    return { success: true, data: response.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function criarPromocao(body: SalvarPromocao): Promise<ActionResult<number>> {
  try {
    const response = await serverFetch<ApiResponse<number>>("/api/Promocao", {
      method: "POST",
      body,
    });
    return { success: true, data: response.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function atualizarPromocao(
  id: number,
  body: SalvarPromocao
): Promise<ActionResult<string>> {
  try {
    const response = await serverFetch<ApiResponse<string>>(`/api/Promocao/${id}`, {
      method: "PUT",
      body,
    });
    return { success: true, data: response.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function removerPromocao(id: number): Promise<ActionResult<string>> {
  try {
    const response = await serverFetch<ApiResponse<string>>(`/api/Promocao/${id}`, {
      method: "DELETE",
    });
    return { success: true, data: response.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
