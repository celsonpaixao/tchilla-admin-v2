import { ApiException, ERROR_MESSAGES } from "@/types/common.types";

/** Mensagem para mostrar ao utilizador a partir de um erro do serverFetch. */
export function mensagemDeErro(err: unknown): string {
  if (err instanceof ApiException) {
    if (err.status === 403) return "Não tens permissão para esta ação (é preciso o papel Supervisor ou Admin).";
    return err.message && err.message !== "Erro desconhecido" ? err.message : ERROR_MESSAGES[err.type];
  }
  return "Não foi possível contactar o servidor. Tenta novamente.";
}

/** Remove filtros vazios antes de os passar como query string. */
export function semVazios(filtro: object): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(filtro).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== false),
  ) as Record<string, string | number | boolean>;
}
