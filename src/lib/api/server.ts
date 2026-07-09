import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth/cookies";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { ApiException } from "@/types/common.types";
import { ROUTES } from "@/constants/routes";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  formData?: FormData;
  revalidate?: number;
}

export async function serverFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = await getToken();
  const baseURL = getApiBaseUrl();

  let url = `${baseURL}${path}`;
  if (options.params) {
    const searchParams = new URLSearchParams(
      Object.entries(options.params).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
        {} as Record<string, string>
      )
    );
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!options.formData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.formData
      ? options.formData
      : options.body
      ? JSON.stringify(options.body)
      : undefined,
    cache: options.revalidate !== undefined ? undefined : "no-store",
    next: options.revalidate !== undefined ? { revalidate: options.revalidate } : undefined,
  });

  if (res.status === 401) {
    redirect(ROUTES.LOGIN);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiException(
      data.message || data.errorMessage || data.error || "Erro desconhecido",
      res.status
    );
  }

  return res.json();
}
