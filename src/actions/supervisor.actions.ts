"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { SupervisorResponse, CreateSupervisorRequest } from "@/types/supervisor.types";

export async function fetchSupervisores(): Promise<ActionResult<SupervisorResponse[]>> {
  try {
    const data = await serverFetch<ApiResponse<SupervisorResponse[]>>("/api/Supervisor/getAll");
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function criarSupervisor(
  body: CreateSupervisorRequest,
  tornarAdmin = false
): Promise<ActionResult<SupervisorResponse>> {
  try {
    const data = await serverFetch<ApiResponse<SupervisorResponse>>(
      "/api/Auth/register/supervisor",
      { method: "POST", body }
    );
    if (tornarAdmin && data.data?.id) {
      await serverFetch(`/api/Supervisor/tornarAdmin`, {
        method: "PUT",
        params: { id: data.data.id },
      }).catch(() => {});
    }
    return { success: true, data: data.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function tornarAdmin(id: number): Promise<ActionResult<void>> {
  try {
    await serverFetch("/api/Supervisor/tornarAdmin", {
      method: "PUT",
      params: { id },
    });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
