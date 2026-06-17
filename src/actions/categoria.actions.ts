"use server";
import { serverFetch } from "@/lib/api/server";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { CategoryData, SubCategoryData } from "@/types/category.types";

export async function fetchTiposSlug(): Promise<ActionResult<string[]>> {
  try {
    const data = await serverFetch<string[]>("/api/Enum/atributos/tipos");
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchCategorias(): Promise<ActionResult<CategoryData[]>> {
  try {
    const data = await serverFetch<ApiResponse<CategoryData[]>>("/api/Categoria/getAll");
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function fetchSubcategorias(categoriaId: number): Promise<ActionResult<SubCategoryData[]>> {
  try {
    const data = await serverFetch<ApiResponse<SubCategoryData[]>>(
      `/api/SubCategoria/getAll/${categoriaId}`
    );
    return { success: true, data: data.data ?? [] };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function criarCategoria(formData: FormData): Promise<ActionResult<CategoryData>> {
  try {
    const data = await serverFetch<ApiResponse<CategoryData>>("/api/Categoria/create", {
      method: "POST",
      formData,
    });
    return { success: true, data: data.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function atualizarCategoria(formData: FormData): Promise<ActionResult<void>> {
  try {
    await serverFetch(`/api/Categoria/update`, {
      method: "PUT",
      formData,
    });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function deletarCategoria(id: number): Promise<ActionResult<void>> {
  try {
    await serverFetch(`/api/Categoria/Delete/${id}`, { method: "DELETE" });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function criarSubcategoria(formData: FormData): Promise<ActionResult<SubCategoryData>> {
  try {
    const data = await serverFetch<ApiResponse<SubCategoryData>>("/api/SubCategoria/create", {
      method: "POST",
      formData,
    });
    return { success: true, data: data.data };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function atualizarSubcategoria(formData: FormData): Promise<ActionResult<void>> {
  try {
    await serverFetch("/api/SubCategoria/update", { method: "PUT", formData });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}

export async function deletarSubcategoria(id: number): Promise<ActionResult<void>> {
  try {
    await serverFetch(`/api/SubCategoria/Delete`, {
      method: "DELETE",
      params: { id },
    });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: String(err) };
  }
}
