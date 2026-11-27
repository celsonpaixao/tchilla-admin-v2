import { getToken } from "./cookies";
import { getApiBaseUrl } from "@/lib/api/base-url";
import type { UsuarioInterface } from "@/types/user.types";

/**
 * A API não respondeu (sem rede, timeout, erro 5xx). A sessão pode estar boa: quem chama
 * NÃO deve apagar o cookie — o erro vai para o error.tsx, que oferece "Tentar novamente".
 */
export class SessaoIndisponivelError extends Error {
  constructor(motivo: string) {
    super(`Não foi possível validar a sessão: ${motivo}`);
    this.name = "SessaoIndisponivelError";
  }
}

/**
 * Utilizador da sessão atual.
 *  - `null` → não há sessão ou a API recusou o token (401/403/isSuccess=false): ir para o login.
 *  - lança `SessaoIndisponivelError` → falha temporária: manter o cookie.
 *
 * Antes, qualquer falha devolvia `null` e o layout apagava o cookie — no telemóvel, um
 * pico de rede bastava para terminar a sessão.
 */
export async function getSession(): Promise<UsuarioInterface | null> {
  const token = await getToken();
  if (!token) return null;

  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/Usuario/getInfoByToken`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    throw new SessaoIndisponivelError(err instanceof Error && err.name === "TimeoutError" ? "a API demorou demasiado" : "sem ligação à API");
  }

  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new SessaoIndisponivelError(`a API respondeu ${res.status}`);

  const json = await res.json().catch(() => null);
  if (!json) throw new SessaoIndisponivelError("resposta inválida da API");
  if (!json.isSuccess || !json.data) return null;

  return json.data as UsuarioInterface;
}
