"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { NotificacaoBody } from "@/types/settings.types";

export interface PromoCatalogItem {
  id: number;
  nome: string;
  descricao: string | null;
  imagem: string;
  galeria: string[];
  local: string | null;
  tags: string[];
  mediaAvaliacao: number;
  preco: number;
  tipo: string;
}

export async function notificarTodosClientes(
  body: NotificacaoBody,
): Promise<ActionResult<void>> {
  try {
    await serverFetch<ApiResponse<void>>(
      "/api/Notificacao/notificar/todos-clientes",
      {
        method: "POST",
        body,
      },
    );
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function notificarClienteEspecifico(
  userId: number,
  body: NotificacaoBody,
): Promise<ActionResult<void>> {
  try {
    await serverFetch<ApiResponse<void>>(
      `/api/Notificacao/notificar/cliente/${userId}`,
      {
        method: "POST",
        body,
      },
    );
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function notificarTodosParceiros(
  body: NotificacaoBody,
): Promise<ActionResult<void>> {
  try {
    await serverFetch<ApiResponse<void>>(
      "/api/Notificacao/notificar/todos-parceiros",
      {
        method: "POST",
        body,
      },
    );
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function notificarParceiroEspecifico(
  userId: number,
  body: NotificacaoBody,
): Promise<ActionResult<void>> {
  try {
    await serverFetch<ApiResponse<void>>(
      `/api/Notificacao/notificar/parceiro/${userId}`,
      {
        method: "POST",
        body,
      },
    );
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchEnums(): Promise<
  ActionResult<Array<{ name: string; values: string[] }>>
> {
  try {
    const data = await serverFetch<
      ApiResponse<Array<{ name: string; values: string[] }>>
    >("/api/Enum/enums", { revalidate: 3600 });
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function searchPromoCatalog(
  termo: string,
  pagina = 1,
  tamanhoPagina = 10,
): Promise<ActionResult<PromoCatalogItem[]>> {
  const normalized = termo.trim();

  if (normalized.length < 4) {
    return { success: true, data: [] };
  }

  try {
    const data = await serverFetch<PromoCatalogItem[] | ApiResponse<PromoCatalogItem[]>>(
      "/api/Search/propostas",
      {
        params: {
          termo: normalized,
          pagina,
          tamanhoPagina,
        },
        revalidate: 0,
      },
    );

    if (Array.isArray(data)) {
      return { success: true, data };
    }

    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
