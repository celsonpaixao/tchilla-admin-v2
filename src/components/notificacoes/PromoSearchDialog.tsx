"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { GlobalModal } from "@/components/global/GlobalModal";
import { GlobalButton } from "@/components/global/GlobalButton";
import { searchPromoCatalog, type PromoCatalogItem } from "@/actions/campanha.actions";

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

export function PromoSearchDialog({ open, onOpenChange, onSelectItem }: PromoSearchDialogProps) {
  const [termo, setTermo] = useState("");
  const [results, setResults] = useState<PromoCatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch() {
    const normalized = termo.trim();

    if (!normalized) {
      toast.error("Digite um termo para pesquisar.");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const result = await searchPromoCatalog(normalized, 1, 10);
    setIsSearching(false);

    if (!result.success) {
      toast.error(result.error ?? "Erro ao pesquisar catálogo.");
      setResults([]);
      return;
    }

    setResults(result.data);
  }

  function handlePick(item: PromoCatalogItem) {
    onSelectItem(item);
    onOpenChange(false);
  }

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title="Selecionar proposta"
      description="Pesquise um espaço, serviço ou combo para usar na campanha Promo."
      size="xl"
      footer={
        <GlobalButton variant="secondary" onClick={() => onOpenChange(false)}>
          Fechar
        </GlobalButton>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
            <input
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSearch();
                }
              }}
              placeholder="Ex: espaço para casamento, som, combo aniversário…"
              className="w-full rounded-lg border px-10 py-2.5 text-sm outline-none"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border-strong)",
                color: "var(--text)",
              }}
            />
          </div>

          <GlobalButton onClick={handleSearch} loading={isSearching} rightIcon={<Sparkles size={14} />}>
            Pesquisar
          </GlobalButton>
        </div>

        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 py-10" style={{ color: "var(--text-3)" }}>
              <Loader2 size={16} className="animate-spin" />
              A pesquisar propostas…
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-3">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePick(item)}
                  className="flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg" style={{ background: "var(--gray-100)" }}>
                    {item.imagem ? (
                      <Image
                        src={item.imagem}
                        alt={item.nome}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center" style={{ color: "var(--text-3)" }}>
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {item.nome}
                      </h3>
                      <span
                        className="rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide"
                        style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}
                      >
                        {item.tipo}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-xs" style={{ color: "var(--text-3)" }}>
                      {item.descricao || "Sem descrição disponível."}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-1 text-[11px]" style={{ color: "var(--text-2)" }}>
                      <span>{formatPrice(item.preco)}</span>
                      <span>{item.tipoPreco}</span>
                      {item.capacidade ? <span>{item.capacidade} pessoas</span> : null}
                      {item.endereco ? <span>{item.endereco}</span> : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="py-10 text-center text-sm" style={{ color: "var(--text-3)" }}>
              Nenhum resultado encontrado.
            </div>
          ) : (
            <div className="py-10 text-center text-sm" style={{ color: "var(--text-3)" }}>
              Pesquise para encontrar propostas, serviços ou combos.
            </div>
          )}
        </div>
      </div>
    </GlobalModal>
  );
}