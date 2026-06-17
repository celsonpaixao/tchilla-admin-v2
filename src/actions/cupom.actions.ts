"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { CupomData, CreateCupomRequest, UpdateCupomRequest } from "@/types/cupom.types";

export async function fetchCupons(): Promise<ActionResult<CupomData[]>> {
  try {
    const data = await serverFetch<ApiResponse<CupomData[]>>("/api/Cupom/getAll");
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function criarCupom(body: CreateCupomRequest): Promise<ActionResult<CupomData>> {
  try {
    const data = await serverFetch<ApiResponse<CupomData>>("/api/Cupom/create", {
      method: "POST",
      body,
    });
    return { success: true, data: data.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function atualizarCupom(body: UpdateCupomRequest): Promise<ActionResult<void>> {
  try {
    await serverFetch("/api/Cupom/update", {
      method: "PUT",
      body,
    });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function deletarCupom(id: number): Promise<ActionResult<void>> {
  try {
    await serverFetch(`/api/Cupom/delete/${id}`, { method: "DELETE" });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
