"use client";
import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CupomData } from "@/types/cupom.types";
import { criarCupom, atualizarCupom, deletarCupom } from "@/actions/cupom.actions";
import { GlobalModal, ConfirmModal } from "@/components/global/GlobalModal";
import { GlobalInput } from "@/components/global/GlobalInput";
import { GlobalButton } from "@/components/global/GlobalButton";
import { PageShell } from "@/components/global/PageShell";

interface CuponsPageProps {
  initialCupons: CupomData[];
}

function toDateInputValue(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

function toIsoFromDate(dateStr: string) {
  return dateStr ? `${dateStr}T00:00:00.000Z` : "";
}

export function CuponsPage({ initialCupons }: CuponsPageProps) {
  const [cupons, setCupons] = useState(initialCupons);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CupomData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CupomData | null>(null);

  const [nome, setNome] = useState("");
  const [porcentagem, setPorcentagem] = useState("");
  const [validoAte, setValidoAte] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setNome(""); setPorcentagem(""); setValidoAte(""); setAtivo(true);
  }

  function openCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function openEdit(c: CupomData) {
    setNome(c.nome);
    setPorcentagem(String(c.porcentagemDesconto));
    setValidoAte(toDateInputValue(c.validoAte));
    setAtivo(c.ativo);
    setEditTarget(c);
  }

  const isFormValid = nome.trim() !== "" && porcentagem !== "" && validoAte !== "";

  function handleCreate() {
    if (!isFormValid) return;
    startTransition(async () => {
      const result = await criarCupom({
        nome: nome.trim().toUpperCase(),
        porcentagemDesconto: Number(porcentagem),
        validoAte: toIsoFromDate(validoAte),
      });
      if (result.success) {
        toast.success("Cupom criado!");
        setCupons((prev) => [result.data, ...prev]);
        setCreateOpen(false); resetForm();
      } else {
        toast.error(result.error ?? "Erro ao criar.");
      }
    });
  }

  function handleEdit() {
    if (!editTarget || !isFormValid) return;
    startTransition(async () => {
      const result = await atualizarCupom({
        id: editTarget.id,
        nome: nome.trim().toUpperCase(),
        porcentagemDesconto: Number(porcentagem),
        validoAte: toIsoFromDate(validoAte),
        ativo,
      });
      if (result.success) {
        toast.success("Cupom atualizado!");
        setCupons((prev) =>
          prev.map((c) =>
            c.id === editTarget.id
              ? { ...c, nome: nome.toUpperCase(), porcentagemDesconto: Number(porcentagem), validoAte: toIsoFromDate(validoAte), ativo }
              : c
          )
        );
        setEditTarget(null); resetForm();
      } else {
        toast.error(result.error ?? "Erro ao atualizar.");
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deletarCupom(deleteTarget.id);
      if (result.success) {
        toast.success("Cupom removido!");
        setCupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error(result.error ?? "Erro ao remover.");
      }
    });
  }

  function handleToggleAtivo(c: CupomData) {
    startTransition(async () => {
      const result = await atualizarCupom({
        id: c.id,
        nome: c.nome,
        porcentagemDesconto: c.porcentagemDesconto,
        validoAte: c.validoAte,
        ativo: !c.ativo,
      });
      if (result.success) {
        setCupons((prev) =>
          prev.map((x) => (x.id === c.id ? { ...x, ativo: !c.ativo } : x))
        );
        toast.success(c.ativo ? "Cupom desativado." : "Cupom ativado!");
      } else {
        toast.error(result.error ?? "Erro ao atualizar.");
      }
    });
  }

  const ativos   = cupons.filter((c) => c.ativo).length;
  const expirados = cupons.filter((c) => isPast(parseISO(c.validoAte))).length;

  return (
    <PageShell
      title="Cupons"
      subtitle={`${cupons.length} cupons · ${ativos} ativos · ${expirados} expirados`}
      actions={
        <GlobalButton leftIcon={<Plus size={15} />} onClick={openCreate}>
          Novo Cupom
        </GlobalButton>
      }
    >
      {/* ── KPIs rápidos ── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total",     value: cupons.length,   color: "var(--text-2)" },
          { label: "Ativos",    value: ativos,           color: "var(--blue-700)" },
          { label: "Expirados", value: expirados,        color: "var(--danger-fg)" },
        ].map((k) => (
          <div key={k.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabela ── */}
      <div className="card overflow-hidden">
        {/* Cabeçalho da tabela */}
        <div
          className="grid gap-3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide"
          style={{
            gridTemplateColumns: "1fr 100px 130px 80px 120px 80px",
            color: "var(--text-3)",
            borderBottom: "1px solid var(--border)",
            background: "var(--gray-25)",
          }}
        >
          <span>Código</span>
          <span className="text-center">Desconto</span>
          <span>Válido até</span>
          <span className="text-center">Status</span>
          <span>Criado em</span>
          <span className="text-right">Ações</span>
        </div>

        {cupons.length === 0 ? (
          <div className="py-14 text-center">
            <Tag size={28} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm" style={{ color: "var(--text-3)" }}>Nenhum cupom cadastrado</p>
          </div>
        ) : (
          cupons.map((c) => {
            const expired = isPast(parseISO(c.validoAte));
            return (
              <div
                key={c.id}
                className="grid gap-3 px-4 py-3 items-center"
                style={{
                  gridTemplateColumns: "1fr 100px 130px 80px 120px 80px",
                  borderBottom: "1px solid var(--border)",
                  transition: "background .1s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--gray-25)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                {/* Código */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}
                  >
                    <Tag size={13} />
                  </div>
                  <span
                    className="text-sm font-semibold font-mono truncate"
                    style={{ color: "var(--text)", letterSpacing: "0.04em" }}
                  >
                    {c.nome}
                  </span>
                </div>

                {/* Desconto */}
                <div className="text-center">
                  <span
                    className="text-sm font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}
                  >
                    {c.porcentagemDesconto}%
                  </span>
                </div>

                {/* Válido até */}
                <div>
                  <p
                    className="text-sm"
                    style={{ color: expired ? "var(--danger-fg)" : "var(--text)" }}
                  >
                    {format(parseISO(c.validoAte), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                  {expired && (
                    <p className="text-xs" style={{ color: "var(--danger-fg)" }}>Expirado</p>
                  )}
                </div>

                {/* Status + toggle */}
                <div className="flex justify-center">
                  <button
                    onClick={() => handleToggleAtivo(c)}
                    className="flex items-center gap-1.5 cursor-pointer"
                    title={c.ativo ? "Desativar" : "Ativar"}
                    style={{ color: c.ativo ? "var(--blue-700)" : "var(--text-3)" }}
                  >
                    {c.ativo
                      ? <ToggleRight size={22} />
                      : <ToggleLeft size={22} />
                    }
                  </button>
                </div>

                {/* Criado em */}
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {format(parseISO(c.criadoEm), "dd MMM yyyy", { locale: ptBR })}
                </p>

                {/* Ações */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                    style={{ color: "var(--text-3)" }}
                    aria-label="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                    style={{ color: "var(--danger-fg)" }}
                    aria-label="Remover"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal Criar / Editar ── */}
      <GlobalModal
        open={createOpen || !!editTarget}
        onOpenChange={(o) => {
          if (!o) { setCreateOpen(false); setEditTarget(null); resetForm(); }
        }}
        title={editTarget ? "Editar Cupom" : "Novo Cupom"}
        size="sm"
        footer={
          <>
            <GlobalButton
              variant="outline"
              onClick={() => { setCreateOpen(false); setEditTarget(null); resetForm(); }}
            >
              Cancelar
            </GlobalButton>
            <GlobalButton
              onClick={editTarget ? handleEdit : handleCreate}
              loading={isPending}
              disabled={!isFormValid}
            >
              {editTarget ? "Salvar" : "Criar"}
            </GlobalButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlobalInput
            id="cupom-nome"
            label="Código do Cupom"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value.toUpperCase())}
            placeholder="Ex: FESTSHOW20"
            hint="Será convertido para maiúsculas automaticamente"
            style={{ fontFamily: "var(--mono)", letterSpacing: "0.05em" }}
          />
          <GlobalInput
            id="cupom-pct"
            label="Percentagem de Desconto"
            required
            type="number"
            min={1}
            max={100}
            value={porcentagem}
            onChange={(e) => setPorcentagem(e.target.value)}
            placeholder="Ex: 15"
            hint="Valor entre 1 e 100 (%)"
            rightIcon={<span style={{ fontSize: 13, fontWeight: 600 }}>%</span>}
          />

          {/* Data de validade */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)", display: "flex", gap: 6, alignItems: "center" }}>
              Válido até <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="date"
              value={validoAte}
              onChange={(e) => setValidoAte(e.target.value)}
              style={{
                height: "var(--control-h)",
                width: "100%",
                padding: "0 var(--pad-x)",
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--r-md)",
                fontFamily: "inherit",
                fontSize: "var(--font-ui)",
                color: validoAte ? "var(--text)" : "var(--text-3)",
                outline: "none",
                transition: "border-color .12s, box-shadow .12s",
                colorScheme: "light",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--blue)"; e.target.style.boxShadow = "0 0 0 3px var(--ring)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Toggle ativo — só no edit */}
          {editTarget && (
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Cupom ativo</p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {ativo ? "O cupom está disponível para uso" : "O cupom está desativado"}
                </p>
              </div>
              <button
                onClick={() => setAtivo((v) => !v)}
                className="cursor-pointer flex-shrink-0"
                style={{ color: ativo ? "var(--blue-700)" : "var(--text-3)" }}
              >
                {ativo ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          )}
        </div>
      </GlobalModal>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remover cupom?"
        description={`O cupom "${deleteTarget?.nome}" será removido permanentemente.`}
        onConfirm={handleDelete}
        loading={isPending}
        confirmLabel="Remover"
      />
    </PageShell>
  );
}
