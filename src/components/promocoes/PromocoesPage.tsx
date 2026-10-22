"use client";
import { useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, Edit2, Image as ImageIcon, Plus, Search, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  atualizarPromocao,
  criarPromocao,
  fetchPromocaoDetalhe,
  fetchPromocoes,
  removerPromocao,
} from "@/actions/promocao.actions";
import { ConfirmModal, GlobalModal } from "@/components/global/GlobalModal";
import { GlobalButton } from "@/components/global/GlobalButton";
import { GlobalInput } from "@/components/global/GlobalInput";
import { GlobalSelect } from "@/components/global/GlobalSelect";
import { PageShell } from "@/components/global/PageShell";
import type {
  PromocaoCatalogoItem,
  PromocaoCatalogos,
  PromocaoDetalhe,
  PromocaoResumo,
  SalvarPromocao,
} from "@/types/promotion.types";

interface PromocoesPageProps {
  initialPromocoes: PromocaoResumo[];
  catalogos: PromocaoCatalogos;
  initialErrors: string[];
}

interface FormState {
  titulo: string;
  descricao: string;
  imagemUrl: string;
  alvoTipo: "espaco" | "servico";
  alvoId: string;
  percentualDesconto: string;
  minServicosExtra: string;
  ativa: boolean;
  inicioEm: string;
  fimEm: string;
  servicoIds: number[];
}

const EMPTY_FORM: FormState = {
  titulo: "",
  descricao: "",
  imagemUrl: "",
  alvoTipo: "servico",
  alvoId: "",
  percentualDesconto: "",
  minServicosExtra: "2",
  ativa: true,
  inicioEm: "",
  fimEm: "",
  servicoIds: [],
};

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function formatDate(value?: string | null) {
  if (!value) return "Sem limite";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Data inválida"
    : new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function estadoPromocao(promocao: PromocaoResumo) {
  const now = Date.now();
  if (!promocao.ativa) return "Inativa";
  if (promocao.inicioEm && new Date(promocao.inicioEm).getTime() > now) return "Agendada";
  if (promocao.fimEm && new Date(promocao.fimEm).getTime() < now) return "Expirada";
  return "Ativa";
}

function moeda(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "AOA", maximumFractionDigits: 0 }).format(value);
}

function catalogLabel(item: PromocaoCatalogoItem) {
  return `${item.nome} · ${moeda(item.preco)}`;
}

export function PromocoesPage({ initialPromocoes, catalogos, initialErrors }: PromocoesPageProps) {
  const [promocoes, setPromocoes] = useState(initialPromocoes);
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PromocaoResumo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromocaoResumo | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");

  const alvos = form.alvoTipo === "espaco" ? catalogos.espacos : catalogos.servicos;
  const selectedTarget = alvos.find((item) => item.id === Number(form.alvoId));
  const servicosElegiveis = useMemo(
    () => catalogos.servicos
      .filter((item) => item.contratavel && !(form.alvoTipo === "servico" && item.id === Number(form.alvoId)))
      .filter((item) => item.nome.toLocaleLowerCase().includes(serviceSearch.toLocaleLowerCase())),
    [catalogos.servicos, form.alvoTipo, form.alvoId, serviceSearch]
  );
  const promocoesFiltradas = promocoes.filter((promocao) =>
    `${promocao.titulo} ${promocao.alvo?.nome ?? ""}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );
  const minimum = Math.max(1, Number(form.minServicosExtra) || 1);
  const selectedEligibleCount = form.servicoIds.filter((id) =>
    !(form.alvoTipo === "servico" && id === Number(form.alvoId))
  ).length;

  function change<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setServiceSearch("");
    setTargetSearch("");
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  async function openEdit(promocao: PromocaoResumo) {
    setIsLoadingEdit(true);
    const result = await fetchPromocaoDetalhe(promocao.id);
    setIsLoadingEdit(false);
    if (!result.success) {
      toast.error(result.error || "Não foi possível carregar a promoção.");
      return;
    }
    const detalhe: PromocaoDetalhe = result.data;
    setServiceSearch("");
    setTargetSearch("");
    setEditTarget(promocao);
    setForm({
      titulo: detalhe.titulo,
      descricao: detalhe.descricao ?? "",
      imagemUrl: detalhe.imagemUrl ?? "",
      alvoTipo: detalhe.alvo.tipo,
      alvoId: String(detalhe.alvo.id),
      percentualDesconto: String(detalhe.percentualDesconto),
      minServicosExtra: String(detalhe.minServicosExtra),
      ativa: detalhe.ativa,
      inicioEm: toDatetimeLocal(detalhe.inicioEm),
      fimEm: toDatetimeLocal(detalhe.fimEm),
      servicoIds: detalhe.servicosElegiveis.map((servico) => servico.id),
    });
    setOpen(true);
  }

  function toggleServico(id: number) {
    setForm((current) => ({
      ...current,
      servicoIds: current.servicoIds.includes(id)
        ? current.servicoIds.filter((selectedId) => selectedId !== id)
        : [...current.servicoIds, id],
    }));
  }

  async function atualizarLista() {
    const result = await fetchPromocoes();
    if (result.success) {
      setPromocoes(result.data);
    } else {
      toast.error(result.error || "A promoção foi salva, mas a lista não pôde ser atualizada.");
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.titulo.trim()) {
      toast.error("Indique o título da promoção.");
      return;
    }
    if (!form.alvoId || !selectedTarget) {
      toast.error("Selecione um espaço ou serviço para destacar.");
      return;
    }
    const percentual = Number(form.percentualDesconto.replace(",", "."));
    const minServicos = Number(form.minServicosExtra);
    if (!Number.isFinite(percentual) || percentual <= 0 || percentual > 100) {
      toast.error("O desconto tem de estar entre 0 e 100%.");
      return;
    }
    if (!Number.isInteger(minServicos) || minServicos < 1) {
      toast.error("O mínimo de serviços extra tem de ser pelo menos 1.");
      return;
    }
    if (selectedEligibleCount < minServicos) {
      toast.error(`Selecione pelo menos ${minServicos} serviços elegíveis.`);
      return;
    }
    if (form.inicioEm && form.fimEm && new Date(form.fimEm) < new Date(form.inicioEm)) {
      toast.error("A data de fim tem de ser posterior à data de início.");
      return;
    }

    const body: SalvarPromocao = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      imagemUrl: form.imagemUrl.trim() || null,
      alvoTipo: form.alvoTipo,
      alvoId: Number(form.alvoId),
      percentualDesconto: percentual,
      minServicosExtra: minServicos,
      ativa: form.ativa,
      inicioEm: toIso(form.inicioEm),
      fimEm: toIso(form.fimEm),
      servicoIds: form.servicoIds,
    };

    setIsSaving(true);
    const result = editTarget
      ? await atualizarPromocao(editTarget.id, body)
      : await criarPromocao(body);
    setIsSaving(false);
    if (!result.success) {
      toast.error(result.error || "Não foi possível guardar a promoção.");
      return;
    }

    toast.success(editTarget ? "Promoção atualizada." : "Promoção criada.");
    setOpen(false);
    resetForm();
    await atualizarLista();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await removerPromocao(deleteTarget.id);
    setIsDeleting(false);
    if (!result.success) {
      toast.error(result.error || "Não foi possível remover a promoção.");
      return;
    }
    toast.success("Promoção removida.");
    setPromocoes((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const inputGrid = "grid grid-cols-1 sm:grid-cols-2 gap-4";

  return (
    <PageShell
      title="Promoções"
      subtitle="Crie ofertas com desconto desbloqueado pela contratação de serviços elegíveis."
      actions={
        <GlobalButton onClick={openCreate} leftIcon={<Plus size={15} />}>
          Nova promoção
        </GlobalButton>
      }
    >
      {initialErrors.length > 0 && (
        <div className="rounded-xl px-4 py-3 space-y-1" style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--danger-fg)" }}>Alguns dados não foram carregados</p>
          {initialErrors.map((error) => <p key={error} className="text-xs" style={{ color: "var(--danger-fg)" }}>{error}</p>)}
        </div>
      )}

      <section className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative w-full max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar promoções..."
              className="w-full rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
              style={{ border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)" }}
            />
          </div>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>{promocoes.length} promoção(ões)</span>
        </div>

        {promocoesFiltradas.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full" style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}>
              <Tag size={20} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {promocoes.length === 0 ? "Ainda não existem promoções" : "Nenhuma promoção encontrada"}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
              {promocoes.length === 0 ? "Crie a primeira oferta para a apresentar aos clientes." : "Experimente outro termo de pesquisa."}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {promocoesFiltradas.map((promocao) => {
              const estado = estadoPromocao(promocao);
              const stateColor = estado === "Ativa" ? "var(--success-fg)" : estado === "Agendada" ? "var(--info-fg)" : "var(--text-3)";
              const stateBackground = estado === "Ativa" ? "var(--success-bg)" : estado === "Agendada" ? "var(--info-bg)" : "var(--gray-100)";
              return (
                <article key={promocao.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg" style={{ background: "var(--pink-50)", color: "var(--pink-700)" }}>
                    {promocao.imagemUrl ? (
                      // A imagem promocional é uma URL remota fornecida pelo backend.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={promocao.imagemUrl} alt="" className="h-full w-full object-cover" />
                    ) : <ImageIcon size={19} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold" style={{ color: "var(--text)" }}>{promocao.titulo}</h2>
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: stateBackground, color: stateColor }}>{estado}</span>
                    </div>
                    <p className="mt-1 truncate text-xs" style={{ color: "var(--text-2)" }}>
                      {promocao.alvo?.tipo === "espaco" ? "Espaço" : "Serviço"}: {promocao.alvo?.nome ?? `#${promocao.alvo?.id}`}
                      {" · "}{promocao.minServicosExtra} serviço(s) para desbloquear
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px]" style={{ color: "var(--text-3)" }}>
                      <CalendarDays size={12} /> {formatDate(promocao.inicioEm)} <span aria-hidden="true">→</span> {formatDate(promocao.fimEm)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: "var(--pink-700)" }}>{promocao.percentualDesconto}%</p>
                      <p className="text-[11px]" style={{ color: "var(--text-3)" }}>de desconto</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => void openEdit(promocao)}
                        disabled={isLoadingEdit}
                        aria-label={`Editar ${promocao.titulo}`}
                        className="grid h-9 w-9 place-items-center rounded-lg transition-colors disabled:opacity-50"
                        style={{ color: "var(--text-2)" }}
                      ><Edit2 size={15} /></button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(promocao)}
                        aria-label={`Remover ${promocao.titulo}`}
                        className="grid h-9 w-9 place-items-center rounded-lg transition-colors"
                        style={{ color: "var(--danger)" }}
                      ><Trash2 size={15} /></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <GlobalModal
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) resetForm();
        }}
        title={editTarget ? "Editar promoção" : "Criar promoção"}
        description="Defina o item em destaque e os serviços necessários para desbloquear o desconto."
        size="xl"
        footer={
          <>
            <GlobalButton variant="secondary" onClick={() => setOpen(false)}>Cancelar</GlobalButton>
            <GlobalButton form="promotion-form" type="submit" loading={isSaving} leftIcon={<Check size={15} />}>
              {editTarget ? "Guardar alterações" : "Criar promoção"}
            </GlobalButton>
          </>
        }
      >
        <form id="promotion-form" onSubmit={handleSave} className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
          <div className={inputGrid}>
            <GlobalInput
              id="promotion-title"
              label="Título"
              required
              value={form.titulo}
              onChange={(event) => change("titulo", event.target.value)}
              placeholder="Ex.: Festa completa"
            />
            <GlobalInput
              id="promotion-discount"
              label="Desconto (%)"
              required
              type="number"
              min="0.01"
              max="100"
              step="0.01"
              value={form.percentualDesconto}
              onChange={(event) => change("percentualDesconto", event.target.value)}
              placeholder="Ex.: 15"
            />
          </div>

          <div className={inputGrid}>
            <GlobalSelect
              id="promotion-target-type"
              label="Tipo de item em destaque"
              value={form.alvoTipo}
              onChange={(event) => {
                change("alvoTipo", event.target.value as FormState["alvoTipo"]);
                change("alvoId", "");
              }}
            >
              <option value="servico">Serviço</option>
              <option value="espaco">Espaço</option>
            </GlobalSelect>
            <GlobalSelect
              id="promotion-target"
              label="Item em destaque"
              required
              value={form.alvoId}
              onChange={(event) => {
                const targetId = Number(event.target.value);
                setForm((current) => ({
                  ...current,
                  alvoId: event.target.value,
                  servicoIds: current.alvoTipo === "servico"
                    ? current.servicoIds.filter((id) => id !== targetId)
                    : current.servicoIds,
                }));
              }}
            >
              <option value="">Selecionar {form.alvoTipo === "espaco" ? "espaço" : "serviço"}</option>
              {editTarget && editTarget.alvo.tipo === form.alvoTipo &&
                !alvos.some((item) => item.id === editTarget.alvo.id) && (
                  <option value={editTarget.alvo.id}>{editTarget.alvo.nome}</option>
                )}
              {alvos.filter((item) => item.contratavel && item.nome.toLocaleLowerCase().includes(targetSearch.toLocaleLowerCase())).map((item) => (
                <option key={item.id} value={item.id}>{catalogLabel(item)}</option>
              ))}
            </GlobalSelect>
          </div>
          <div className="relative -mt-2">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
            <input
              value={targetSearch}
              onChange={(event) => setTargetSearch(event.target.value)}
              placeholder={`Filtrar ${form.alvoTipo === "espaco" ? "espaços" : "serviços"}...`}
              className="w-full rounded-lg py-2 pl-8 pr-3 text-xs outline-none"
              style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)" }}
            />
          </div>
          {selectedTarget && (
            <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "var(--blue-50)", color: "var(--blue-800)" }}>
              Selecionado: <strong>{selectedTarget.nome}</strong> · {moeda(selectedTarget.preco)}
            </div>
          )}

          <div className={inputGrid}>
            <GlobalInput
              id="promotion-min-services"
              label="Mínimo de serviços extra"
              required
              type="number"
              min="1"
              step="1"
              value={form.minServicosExtra}
              onChange={(event) => change("minServicosExtra", event.target.value)}
              hint="Quantidade necessária para o cliente desbloquear o desconto."
            />
            <div className="flex items-end">
              <label className="flex h-[var(--control-h)] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-sm" style={{ border: "1px solid var(--border-strong)", color: "var(--text)" }}>
                <input type="checkbox" checked={form.ativa} onChange={(event) => change("ativa", event.target.checked)} />
                Promoção ativa
              </label>
            </div>
          </div>

          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Serviços elegíveis</h3>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>Serviços que o cliente precisa contratar para desbloquear o desconto.</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{
                background: selectedEligibleCount >= minimum ? "var(--success-bg)" : "var(--warning-bg)",
                color: selectedEligibleCount >= minimum ? "var(--success-fg)" : "var(--warning-fg)",
              }}>
                {selectedEligibleCount} / {minimum} selecionados
              </span>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
              <input
                value={serviceSearch}
                onChange={(event) => setServiceSearch(event.target.value)}
                placeholder="Pesquisar serviços elegíveis..."
                className="w-full rounded-lg py-2 pl-8 pr-3 text-xs outline-none"
                style={{ border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)" }}
              />
            </div>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-1.5" style={{ borderColor: "var(--border)" }}>
              {servicosElegiveis.length === 0 ? (
                <p className="px-3 py-5 text-center text-xs" style={{ color: "var(--text-3)" }}>Nenhum serviço elegível encontrado.</p>
              ) : servicosElegiveis.map((servico) => (
                <label key={servico.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-[var(--gray-50)]">
                  <input
                    type="checkbox"
                    checked={form.servicoIds.includes(servico.id)}
                    onChange={() => toggleServico(servico.id)}
                    className="accent-[var(--blue)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium" style={{ color: "var(--text)" }}>{servico.nome}</span>
                    <span className="block truncate text-[11px]" style={{ color: "var(--text-3)" }}>{servico.descricao || "Sem descrição"}</span>
                  </span>
                  <span className="whitespace-nowrap text-xs font-medium" style={{ color: "var(--text-2)" }}>{moeda(servico.preco)}</span>
                </label>
              ))}
            </div>
            {selectedEligibleCount < minimum && (
              <p className="text-xs" style={{ color: "var(--warning-fg)" }}>
                Selecione mais {minimum - selectedEligibleCount} serviço(s) para cumprir o mínimo.
              </p>
            )}
          </section>

          <GlobalInput
            id="promotion-description"
            label="Descrição"
            optional
            value={form.descricao}
            onChange={(event) => change("descricao", event.target.value)}
            placeholder="Detalhe as condições da promoção."
          />
          <GlobalInput
            id="promotion-image"
            label="URL da imagem"
            optional
            type="url"
            value={form.imagemUrl}
            onChange={(event) => change("imagemUrl", event.target.value)}
            placeholder="https://..."
          />

          <div className={inputGrid}>
            <GlobalInput
              id="promotion-start"
              label="Início"
              optional
              type="datetime-local"
              leftIcon={<Clock3 size={14} />}
              value={form.inicioEm}
              onChange={(event) => change("inicioEm", event.target.value)}
            />
            <GlobalInput
              id="promotion-end"
              label="Fim"
              optional
              type="datetime-local"
              leftIcon={<CalendarDays size={14} />}
              value={form.fimEm}
              onChange={(event) => change("fimEm", event.target.value)}
            />
          </div>
        </form>
      </GlobalModal>

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(nextOpen) => { if (!nextOpen) setDeleteTarget(null); }}
        title="Remover promoção?"
        description={`A promoção "${deleteTarget?.titulo ?? ""}" será removida permanentemente.`}
        onConfirm={() => void handleDelete()}
        loading={isDeleting}
        confirmLabel="Remover"
      />
    </PageShell>
  );
}
