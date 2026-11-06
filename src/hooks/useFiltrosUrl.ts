"use client";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Atualiza a query string (filtros) sem recarregar a página; muda de filtro → volta à página 1. */
export function useFiltrosUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  // O router só muda o URL quando o servidor responde; até lá, a query pedida fica aqui
  // para que mudanças seguidas (ex.: pesquisa com atraso) partam dela e não da antiga.
  const pedida = useRef<string | null>(null);

  useEffect(() => {
    if (pedida.current !== null && pedida.current === searchParams.toString()) pedida.current = null;
  }, [searchParams]);

  const queryAtual = useCallback(
    () => new URLSearchParams(pedida.current ?? window.location.search.replace(/^\?/, "")),
    [],
  );

  const atualizar = useCallback(
    (mudancas: Record<string, string | number | undefined>) => {
      const p = queryAtual();
      for (const [k, v] of Object.entries(mudancas)) {
        if (v === undefined || v === "") p.delete(k);
        else p.set(k, String(v));
      }
      if (!("pagina" in mudancas)) p.delete("pagina");
      const qs = p.toString();
      pedida.current = qs;
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [pathname, router, queryAtual],
  );

  const recarregar = useCallback(() => startTransition(() => router.refresh()), [router]);

  return { atualizar, recarregar, isPending, queryAtual };
}
