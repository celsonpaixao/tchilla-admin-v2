"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { CampanhaRequest } from "@/types/settings.types";

export async function enviarCampanha(body: CampanhaRequest): Promise<ActionResult<void>> {
  try {
    await serverFetch<ApiResponse<void>>("/api/Notificacao/push/notificar/user", {
      method: "POST",
      body,
    });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchEnums(): Promise<ActionResult<Array<{ name: string; values: string[] }>>> {
  try {
    const data = await serverFetch<ApiResponse<Array<{ name: string; values: string[] }>>>(
      "/api/Enum/enums",
      { revalidate: 3600 }
    );
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
