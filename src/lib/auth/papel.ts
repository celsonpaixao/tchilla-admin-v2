import { getToken } from "./cookies";

/**
 * Papel ("Supervisor" ou "Admin") lido do token da sessão. Serve só para esconder botões que o
 * back-end ia recusar; quem decide é sempre a API, que valida o token.
 */
export async function papelDaSessao(): Promise<string | null> {
  const token = await getToken();
  const corpo = token?.split(".")[1];
  if (!corpo) return null;
  try {
    const json = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8")) as { papel?: unknown };
    return typeof json.papel === "string" ? json.papel : null;
  } catch {
    return null;
  }
}
