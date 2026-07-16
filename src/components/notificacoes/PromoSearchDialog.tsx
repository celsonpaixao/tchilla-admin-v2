"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, Loader2, Image as ImageIcon, Star } from "lucide-react";
import { toast } from "sonner";
import { GlobalModal } from "@/components/global/GlobalModal";
import { searchPromoCatalog, type PromoCatalogItem } from "@/actions/campanha.actions";

const MIN_SEARCH_LENGTH = 4;
const SEARCH_DEBOUNCE_MS = 350;
const RESULTS_PER_PAGE = 6;

interface PromoSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectItem: (item: PromoCatalogItem) => void;
}

function formatPrice(value: number, currency = "AOA") {
  try {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatRating(value: number) {
  return value > 0 ? value.toFixed(1) : "0";
}

export function PromoSearchDialog({ open, onOpenChange, onSelectItem }: PromoSearchDialogProps) {
  const [termo, setTermo] = useState("");
  const [results, setResults] = useState<PromoCatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchRequestId = useRef(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    const normalized = termo.trim();

    if (normalized.length < MIN_SEARCH_LENGTH) {
      setIsSearching(false);
      setHasSearched(false);
      setResults([]);
      setHasMore(false);
      return;
    }

    searchRequestId.current += 1;
    const requestId = searchRequestId.current;

    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setHasSearched(true);

      void searchPromoCatalog(normalized, page, RESULTS_PER_PAGE).then((result) => {
        if (searchRequestId.current !== requestId) {
          return;
        }

        setIsSearching(false);

        if (!result.success) {
          toast.error(result.error ?? "Erro ao pesquisar catálogo.");
          setResults([]);
          setHasMore(false);
          return;
        }

        setResults(result.data);
        setHasMore(result.data.length === RESULTS_PER_PAGE);
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [open, termo, page]);

  function handlePick(item: PromoCatalogItem) {
    onSelectItem(item);
    onOpenChange(false);
  }

  function handleTermChange(value: string) {
    setTermo(value);
    setPage(1);
  }

  function getPrimaryTag(item: PromoCatalogItem) {
    return item.tags[0] ?? item.tipo;
  }

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title="Selecionar proposta"
      description="Pesquise um espaço, serviço ou combo para usar na campanha Promo."
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
            <input
              value={termo}
              onChange={(e) => handleTermChange(e.target.value)}
              placeholder="Digite pelo menos 4 caracteres…"
              className="w-full rounded-lg border px-10 py-2.5 text-sm outline-none"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border-strong)",
                color: "var(--text)",
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 py-10" style={{ color: "var(--text-3)" }}>
              <Loader2 size={16} className="animate-spin" />
              A pesquisar propostas…
            </div>
          ) : termo.trim().length > 0 && termo.trim().length < MIN_SEARCH_LENGTH ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--text-3)" }}>
              Digite mais {MIN_SEARCH_LENGTH - termo.trim().length} caractere{MIN_SEARCH_LENGTH - termo.trim().length === 1 ? "" : "s"} para começar a buscar.
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <div className="grid max-h-[52vh] gap-2 overflow-y-auto pr-1">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePick(item)}
                  className="flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors cursor-pointer"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="relative h-14 w-16 flex-shrink-0 overflow-hidden rounded-md" style={{ background: "var(--gray-100)" }}>
                    {item.imagem ? (
                      <Image
                        src={item.imagem}
                        alt={item.nome}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center" style={{ color: "var(--text-3)" }}>
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold leading-tight" style={{ color: "var(--text)" }}>
                        {item.nome}
                      </h3>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}
                      >
                        {getPrimaryTag(item)}
                      </span>
                    </div>

                    <p className="line-clamp-1 text-[11px] leading-tight" style={{ color: "var(--text-3)" }}>
                      {item.descricao || item.local || "Sem descrição disponível."}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-[10px]" style={{ color: "var(--text-2)" }}>
                      <span className="font-medium">{formatPrice(item.preco)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Star size={9} fill="currentColor" />
                        {formatRating(item.mediaAvaliacao)}
                      </span>
                      {item.local ? <span className="truncate">{item.local}</span> : null}
                    </div>
                  </div>
                </button>
              ))}
              </div>

              <div className="flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                <div className="text-xs" style={{ color: "var(--text-3)" }}>
                  Página {page}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1 || isSearching}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: "var(--surface)", borderColor: "var(--border-strong)", color: "var(--text)" }}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={!hasMore || isSearching}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: "var(--surface)", borderColor: "var(--border-strong)", color: "var(--text)" }}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--text-3)" }}>
              Nenhum resultado encontrado.
            </div>
          ) : (
            <div className="py-10 text-center text-sm" style={{ color: "var(--text-3)" }}>
              Pesquise propostas, serviços ou combos digitando 4 ou mais caracteres.
            </div>
          )}
        </div>
      </div>
    </GlobalModal>
  );
}