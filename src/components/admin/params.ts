/** Leitura dos filtros que vêm na query string das páginas de administração. */

export type SearchParams = Record<string, string | string[] | undefined>;

export const PAGE_SIZE = 20;

export const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export const pagina = (v: string | string[] | undefined) => Math.max(1, Number(um(v)) || 1);

export const dataIso = (v: string | string[] | undefined) => {
  const s = um(v);
  return s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
};

export const inteiro = (v: string | string[] | undefined) => {
  const n = Number(um(v));
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

export const texto = (v: string | string[] | undefined) => um(v)?.trim() || undefined;

/** O valor só passa se for um dos permitidos. */
export function opcao<T extends string>(v: string | string[] | undefined, opcoes: readonly T[]): T | undefined {
  const s = um(v);
  return opcoes.includes(s as T) ? (s as T) : undefined;
}

/** Data de hoje (fuso local) no formato aaaa-mm-dd, deslocada `dias`. */
export function hojeIso(dias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
