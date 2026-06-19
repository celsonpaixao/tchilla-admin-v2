"use client";
import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import NextImage from "next/image";
import type { CategoryData, SubCategoryData } from "@/types/category.types";
import {
  criarCategoria, atualizarCategoria, deletarCategoria,
  fetchSubcategorias, criarSubcategoria, atualizarSubcategoria, deletarSubcategoria,
} from "@/actions/categoria.actions";
import { GlobalModal, ConfirmModal } from "@/components/global/GlobalModal";
import { GlobalInput } from "@/components/global/GlobalInput";
import { GlobalSelect } from "@/components/global/GlobalSelect";
import { GlobalButton } from "@/components/global/GlobalButton";
import { GlobalImageUpload } from "@/components/global/GlobalImageUpload";
import { PageShell } from "@/components/global/PageShell";

interface CategoryPageProps {
  initialCategorias: CategoryData[];
  slugOptions: string[];
}


type SubModal =
  | { mode: "create"; cat: CategoryData }
  | { mode: "edit"; sub: SubCategoryData; cat: CategoryData }
  | null;

export function CategoryPage({ initialCategorias, slugOptions }: CategoryPageProps) {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [subcategorias, setSubcategorias] = useState<Record<number, SubCategoryData[]>>({});
  const [loadingSubId, setLoadingSubId] = useState<number | null>(null);

  // Category modal
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryData | null>(null);

  // Category form fields
  const [catNome, setCatNome] = useState("");
  const [catDescricao, setCatDescricao] = useState("");
  const [catFoto, setCatFoto] = useState<File | null>(null);

  // Subcategory modal
  const [subModal, setSubModal] = useState<SubModal>(null);
  const [deleteSub, setDeleteSub] = useState<SubCategoryData | null>(null);

  // Subcategory form fields
  const [subNome, setSubNome] = useState("");
  const [subDescricao, setSubDescricao] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subFoto, setSubFoto] = useState<File | null>(null);
  const [subTipo, setSubTipo] = useState(1);

  const [isPending, startTransition] = useTransition();

  function resetCatForm() {
    setCatNome(""); setCatDescricao(""); setCatFoto(null);
  }

  function resetSubForm() {
    setSubNome(""); setSubDescricao(""); setSubSlug(""); setSubFoto(null); setSubTipo(1);
  }

  async function toggleExpand(cat: CategoryData) {
    if (expandedId === cat.id) { setExpandedId(null); return; }
    setExpandedId(cat.id);
    if (!subcategorias[cat.id]) {
      setLoadingSubId(cat.id);
      const result = await fetchSubcategorias(cat.id);
      if (result.success) setSubcategorias((prev) => ({ ...prev, [cat.id]: result.data }));
      setLoadingSubId(null);
    }
  }

  function openEditCat(cat: CategoryData) {
    setEditTarget(cat);
    setCatNome(cat.nome);
    setCatDescricao(cat.descricao);
    setCatFoto(null);
  }

  function openCreateSub(cat: CategoryData) {
    resetSubForm();
    setSubModal({ mode: "create", cat });
  }

  function openEditSub(sub: SubCategoryData, cat: CategoryData) {
    setSubNome(sub.nome);
    setSubDescricao(sub.descricao);
    setSubSlug(sub.slug ?? "");
    setSubTipo(sub.tipo);
    setSubFoto(null);
    setSubModal({ mode: "edit", sub, cat });
  }

  // ── Category handlers ─────────────────────────────────────

  function handleCreate() {
    if (!catNome.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("Nome", catNome);
      fd.append("Descricao", catDescricao);
      if (catFoto) fd.append("Foto", catFoto);
      const result = await criarCategoria(fd);
      if (result.success) {
        toast.success("Categoria criada!");
        setCategorias((prev) => [...prev, result.data]);
        setCreateOpen(false); resetCatForm();
      } else {
        toast.error(result.error ?? "Erro ao criar.");
      }
    });
  }

  function handleEditCat() {
    if (!editTarget || !catNome.trim()) return;
    startTransition(async () => {
      const result = await atualizarCategoria(editTarget.id, catNome, catDescricao, catFoto);
      if (result.success) {
        toast.success("Categoria atualizada!");
        setCategorias((prev) =>
          prev.map((c) =>
            c.id === editTarget.id
              ? { ...c, nome: catNome, descricao: catDescricao }
              : c
          )
        );
        setEditTarget(null); resetCatForm();
      } else {
        toast.error(result.error ?? "Erro ao atualizar.");
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deletarCategoria(deleteTarget.id);
      if (result.success) {
        toast.success("Categoria removida!");
        setCategorias((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error(result.error ?? "Erro ao remover.");
      }
    });
  }

  // ── Subcategory handlers ──────────────────────────────────

  function handleCreateSub() {
    if (subModal?.mode !== "create" || !subNome.trim()) return;
    const cat = subModal.cat;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("Nome", subNome);
      fd.append("Descricao", subDescricao);
      fd.append("Slug", subSlug);
      fd.append("Tipo", String(subTipo));
      fd.append("CategoriaId", String(cat.id));
      if (subFoto) fd.append("Foto", subFoto);
      const result = await criarSubcategoria(fd);
      if (result.success) {
        toast.success("Subcategoria criada!");
        setSubcategorias((prev) => ({
          ...prev,
          [cat.id]: [...(prev[cat.id] ?? []), result.data],
        }));
        setSubModal(null); resetSubForm();
      } else {
        toast.error(result.error ?? "Erro ao criar.");
      }
    });
  }

  function handleEditSub() {
    if (subModal?.mode !== "edit" || !subNome.trim()) return;
    const { sub, cat } = subModal;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("Id", String(sub.id));
      fd.append("Nome", subNome);
      fd.append("Descricao", subDescricao);
      fd.append("Slug", subSlug);
      fd.append("Tipo", String(subTipo));
      if (subFoto) fd.append("Foto", subFoto);
      const result = await atualizarSubcategoria(fd);
      if (result.success) {
        toast.success("Subcategoria atualizada!");
        setSubcategorias((prev) => ({
          ...prev,
          [cat.id]: (prev[cat.id] ?? []).map((s) =>
            s.id === sub.id
              ? { ...s, nome: subNome, descricao: subDescricao, slug: subSlug, tipo: subTipo }
              : s
          ),
        }));
        setSubModal(null); resetSubForm();
      } else {
        toast.error(result.error ?? "Erro ao atualizar.");
      }
    });
  }

  function handleDeleteSub() {
    if (!deleteSub) return;
    startTransition(async () => {
      const result = await deletarSubcategoria(deleteSub.id);
      if (result.success) {
        toast.success("Subcategoria removida!");
        setSubcategorias((prev) => {
          const next = { ...prev };
          for (const key in next) {
            next[key] = next[key].filter((s) => s.id !== deleteSub.id);
          }
          return next;
        });
        setDeleteSub(null);
      } else {
        toast.error(result.error ?? "Erro ao remover.");
      }
    });
  }

  // ── Textarea style helpers ───────────────────────────────

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px var(--pad-x)",
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--r-md)",
    fontFamily: "inherit",
    fontSize: "var(--font-ui)",
    outline: "none",
    resize: "none",
    transition: "border-color .12s, box-shadow .12s",
  };

  const textareaHandlers = {
    onFocus: (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.target.style.borderColor = "var(--blue)";
      e.target.style.boxShadow = "0 0 0 3px var(--ring)";
    },
    onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.target.style.borderColor = "var(--border-strong)";
      e.target.style.boxShadow = "none";
    },
    onMouseEnter: (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (document.activeElement !== e.currentTarget)
        e.currentTarget.style.borderColor = "var(--gray-400)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (document.activeElement !== e.currentTarget)
        e.currentTarget.style.borderColor = "var(--border-strong)";
    },
  };

  // ── Render ────────────────────────────────────────────────

  const subModalTitle =
    subModal?.mode === "create"
      ? `Nova Subcategoria — ${subModal.cat.nome}`
      : subModal?.mode === "edit"
      ? `Editar Subcategoria — ${subModal.sub.nome}`
      : "";

  const subModalAction = subModal?.mode === "create" ? handleCreateSub : handleEditSub;
  const subModalLabel = subModal?.mode === "create" ? "Criar" : "Salvar";

  return (
    <PageShell
      title="Categorias"
      subtitle={`${categorias.length} categorias cadastradas`}
      actions={
        <GlobalButton
          leftIcon={<Plus size={15} />}
          onClick={() => { resetCatForm(); setCreateOpen(true); }}
        >
          Nova Categoria
        </GlobalButton>
      }
    >
      <div className="space-y-3">
        {categorias.map((cat) => (
          <div key={cat.id} className="card overflow-hidden">
            <div
              className="flex items-center gap-4 p-4 cursor-pointer"
              onClick={() => toggleExpand(cat)}
            >
              {cat.foto ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <NextImage src={cat.foto} alt={cat.nome} fill className="object-cover" sizes="40px" />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--blue-50)", color: "var(--blue-600)" }}
                >
                  <ImageIcon size={16} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{cat.nome}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{cat.descricao}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); openEditCat(cat); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                  style={{ color: "var(--text-3)" }}
                  aria-label="Editar categoria"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(cat); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                  style={{ color: "var(--danger-fg)" }}
                  aria-label="Remover categoria"
                >
                  <Trash2 size={13} />
                </button>
                {expandedId === cat.id
                  ? <ChevronUp size={14} style={{ color: "var(--text-3)" }} />
                  : <ChevronDown size={14} style={{ color: "var(--text-3)" }} />
                }
              </div>
            </div>

            {expandedId === cat.id && (
              <div className="border-t" style={{ borderColor: "var(--border)", background: "var(--gray-25)" }}>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "var(--text-3)" }}
                    >
                      Subcategorias
                    </p>
                    <button
                      onClick={() => openCreateSub(cat)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                      style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}
                    >
                      <Plus size={11} /> Adicionar
                    </button>
                  </div>

                  {loadingSubId === cat.id ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => <div key={i} className="skeleton h-8 rounded-lg" />)}
                    </div>
                  ) : (subcategorias[cat.id] ?? []).length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: "var(--text-3)" }}>
                      Nenhuma subcategoria
                    </p>
                  ) : (
                    (subcategorias[cat.id] ?? []).map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                      >
                        {sub.foto ? (
                          <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 relative">
                            <NextImage src={sub.foto} alt={sub.nome} fill className="object-cover" sizes="28px" />
                          </div>
                        ) : (
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: "var(--gray-100)", color: "var(--text-3)" }}
                          >
                            <ImageIcon size={12} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{sub.nome}</p>
                          {sub.slug && (
                            <p className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{sub.slug}</p>
                          )}
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}
                        >
                          {sub.tipo === 1 ? "Serviço" : "Espaço"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditSub(sub, cat)}
                            className="w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                            style={{ color: "var(--text-3)" }}
                            aria-label="Editar subcategoria"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={() => setDeleteSub(sub)}
                            className="w-6 h-6 flex items-center justify-center rounded cursor-pointer"
                            style={{ color: "var(--danger-fg)" }}
                            aria-label="Remover subcategoria"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {categorias.length === 0 && (
          <div className="card py-12 text-center">
            <ImageIcon size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm" style={{ color: "var(--text-3)" }}>Nenhuma categoria cadastrada</p>
          </div>
        )}
      </div>

      {/* ── Modal Criar / Editar Categoria ── */}
      <GlobalModal
        open={createOpen || !!editTarget}
        onOpenChange={(o) => {
          if (!o) { setCreateOpen(false); setEditTarget(null); resetCatForm(); }
        }}
        title={editTarget ? "Editar Categoria" : "Nova Categoria"}
        size="sm"
        footer={
          <>
            <GlobalButton
              variant="outline"
              onClick={() => { setCreateOpen(false); setEditTarget(null); resetCatForm(); }}
            >
              Cancelar
            </GlobalButton>
            <GlobalButton onClick={editTarget ? handleEditCat : handleCreate} loading={isPending}>
              {editTarget ? "Salvar" : "Criar"}
            </GlobalButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlobalInput
            id="cat-nome"
            label="Nome"
            required
            value={catNome}
            onChange={(e) => setCatNome(e.target.value)}
            placeholder="Ex: Espaços de Eventos"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>Descrição</label>
            <textarea
              value={catDescricao}
              onChange={(e) => setCatDescricao(e.target.value)}
              rows={3}
              style={textareaStyle}
              {...textareaHandlers}
            />
          </div>
          <GlobalImageUpload
            label="Foto"
            optional
            value={editTarget?.foto ?? null}
            onChange={setCatFoto}
          />
        </div>
      </GlobalModal>

      {/* ── Modal Criar / Editar Subcategoria ── */}
      <GlobalModal
        open={!!subModal}
        onOpenChange={(o) => { if (!o) { setSubModal(null); resetSubForm(); } }}
        title={subModalTitle}
        size="sm"
        footer={
          <>
            <GlobalButton variant="outline" onClick={() => { setSubModal(null); resetSubForm(); }}>
              Cancelar
            </GlobalButton>
            <GlobalButton onClick={subModalAction} loading={isPending}>
              {subModalLabel}
            </GlobalButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlobalInput
            id="sub-nome"
            label="Nome"
            required
            value={subNome}
            onChange={(e) => setSubNome(e.target.value)}
          />
          <GlobalSelect
            id="sub-slug"
            label="Slug"
            required
            value={subSlug}
            onChange={(e) => setSubSlug(e.target.value)}
          >
            <option value="">Selecionar slug…</option>
            {slugOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </GlobalSelect>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>Descrição</label>
            <textarea
              value={subDescricao}
              onChange={(e) => setSubDescricao(e.target.value)}
              rows={2}
              style={textareaStyle}
              {...textareaHandlers}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>Tipo</label>
            <div className="flex gap-3">
              {[{ value: 1, label: "Serviço" }, { value: 2, label: "Espaço" }].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSubTipo(opt.value)}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: "var(--r-md)",
                    fontSize: "var(--font-ui)",
                    fontWeight: 500,
                    cursor: "pointer",
                    border: `1px solid ${subTipo === opt.value ? "var(--blue)" : "var(--border-strong)"}`,
                    background: subTipo === opt.value ? "var(--blue-50)" : "var(--surface)",
                    color: subTipo === opt.value ? "var(--blue-700)" : "var(--text-2)",
                    transition: "all .12s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <GlobalImageUpload
            label="Foto"
            optional
            value={subModal?.mode === "edit" ? subModal.sub.foto : null}
            onChange={setSubFoto}
          />
        </div>
      </GlobalModal>

      {/* ── Confirm delete categoria ── */}
      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remover categoria?"
        description={`A categoria "${deleteTarget?.nome}" e todas as subcategorias serão removidas permanentemente.`}
        onConfirm={handleDelete}
        loading={isPending}
        confirmLabel="Remover"
      />

      {/* ── Confirm delete subcategoria ── */}
      <ConfirmModal
        open={!!deleteSub}
        onOpenChange={(o) => !o && setDeleteSub(null)}
        title="Remover subcategoria?"
        description={`A subcategoria "${deleteSub?.nome}" será removida permanentemente.`}
        onConfirm={handleDeleteSub}
        loading={isPending}
        confirmLabel="Remover"
      />
    </PageShell>
  );
}
