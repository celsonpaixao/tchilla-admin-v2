"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { ClientesData } from "@/types/client.types";

export async function fetchClientes(): Promise<ActionResult<ClientesData[]>> {
  try {
    const data = await serverFetch<ApiResponse<ClientesData[]>>("/api/Usuario/getAll");
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchNovosClientes(): Promise<ActionResult<ClientesData[]>> {
  try {
    const data = await serverFetch<ApiResponse<ClientesData[]>>("/api/Usuario/getAll/novos");
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchClienteById(id: number): Promise<ActionResult<ClientesData>> {
  try {
    const data = await serverFetch<ApiResponse<ClientesData>>(`/api/Usuario/getOne/${id}`);
    return { success: true, data: data.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function deletarCliente(id: number): Promise<ActionResult<void>> {
  try {
    await serverFetch(`/api/Usuario/deletar/${id}`, { method: "DELETE" });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
