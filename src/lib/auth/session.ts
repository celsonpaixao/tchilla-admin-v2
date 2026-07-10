import { getToken } from "./cookies";
import { getApiBaseUrl } from "@/lib/api/base-url";
import type { UsuarioInterface } from "@/types/user.types";

export async function getSession(): Promise<UsuarioInterface | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/Usuario/getInfoByToken`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (!json.isSuccess) return null;

    return json.data as UsuarioInterface;
  } catch {
    return null;
  }
}
