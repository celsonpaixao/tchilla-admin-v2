"use client";

import { useMemo, useState } from "react";
import { Search, Tag, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GlobalModal } from "@/components/global/GlobalModal";
import { GlobalButton } from "@/components/global/GlobalButton";
import type { CupomData } from "@/types/cupom.types";

interface CupomSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cupons: CupomData[];
  onSelectItem: (item: CupomData) => void;
}

export function CupomSelectDialog({ open, onOpenChange, cupons, onSelectItem }: CupomSelectDialogProps) {
  const [search, setSearch] = useState("");

  const filteredCupons = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cupons;
    return cupons.filter((cupom) => cupom.nome.toLowerCase().includes(term));
  }, [cupons, search]);

  return (
    <GlobalModal
      open={open}
      onOpenChange={onOpenChange}
      title="Selecionar cupom"
      description="Escolha um cupom para preencher os parâmetros da campanha automaticamente."
      size="xl"
      footer={
        <GlobalButton variant="secondary" onClick={() => onOpenChange(false)}>
          Fechar
        </GlobalButton>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cupom por código…"
            className="w-full rounded-lg border px-10 py-2.5 text-sm outline-none"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border-strong)",
              color: "var(--text)",
            }}
          />
        </div>

        <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
          {filteredCupons.length > 0 ? (
            <div className="grid gap-3">
              {filteredCupons.map((cupom) => (
                <button
                  key={cupom.id}
                  onClick={() => {
                    onSelectItem(cupom);
                    onOpenChange(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}>
                      <Tag size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {cupom.nome}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-3)" }}>
                        {cupom.porcentagemDesconto}% de desconto • {format(parseISO(cupom.validoAte), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase"
                    style={{
                      background: cupom.ativo ? "var(--green-50)" : "var(--gray-100)",
                      color: cupom.ativo ? "var(--green-700)" : "var(--text-3)",
                    }}
                  >
                    {cupom.ativo ? "Ativo" : "Inativo"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-10 text-sm" style={{ color: "var(--text-3)" }}>
              <Loader2 size={16} className="animate-spin" />
              Nenhum cupom encontrado.
            </div>
          )}
        </div>
      </div>
    </GlobalModal>
  );
}