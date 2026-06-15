"use client";
import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import NextImage from "next/image";
import type { CategoryData, SubCategoryData } from "@/types/category.types";
import {
  criarCategoria, atualizarCategoria, deletarCategoria,
  fetchSubcategorias, criarSubcategoria, deletarSubcategoria,
} from "@/actions/categoria.actions";
import { GlobalModal, ConfirmModal } from "@/components/global/GlobalModal";
import { GlobalInput } from "@/components/global/GlobalInput";
import { GlobalButton } from "@/components/global/GlobalButton";

interface CategoryPageProps {
  initialCategorias: CategoryData[];
}

export function CategoryPage({ initialCategorias }: CategoryPageProps) {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [subcategorias, setSubcategorias] = useState<Record<number, SubCategoryData[]>>({});
  const [loadingSubId, setLoadingSubId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryData | null>(null);
  const [createSubFor, setCreateSubFor] = useState<CategoryData | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setNome(""); setDescricao(""); setFoto(null); setFotoPreview(null);
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function handleCreate() {
    if (!nome.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("Nome", nome);
      fd.append("Descricao", descricao);
      if (foto) fd.append("Foto", foto);
      const result = await criarCategoria(fd);
      if (result.success) {
        toast.success("Categoria criada!");
        setCategorias((prev) => [...prev, result.data]);
        setCreateOpen(false); resetForm();
      } else {
        toast.error(result.error ?? "Erro ao criar.");
      }
    });
  }

  function handleEdit() {
    if (!editTarget || !nome.trim()) return;
    startTransition(async () => {
      const result = await atualizarCategoria(editTarget.id, nome, descricao);
      if (result.success) {
        toast.success("Categoria atualizada!");
        setCategorias((prev) => prev.map((c) => c.id === editTarget.id ? { ...c, nome, descricao } : c));
        setEditTarget(null); resetForm();
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

  function handleCreateSub() {
    if (!createSubFor || !nome.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("Nome", nome);
      fd.append("Descricao", descricao);
      fd.append("Tipo", "1");
      fd.append("CategoriaId", String(createSubFor.id));
      if (foto) fd.append("Foto", foto);
      const result = await criarSubcategoria(fd);
      if (result.success) {
        toast.success("Subcategoria criada!");
        setSubcategorias((prev) => ({
          ...prev,
          [createSubFor.id]: [...(prev[createSubFor.id] ?? []), result.data],
        }));
        setCreateSubFor(null); resetForm();
      } else {
        toast.error(result.error ?? "Erro ao criar.");
      }
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Categorias</h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>{categorias.length} categorias cadastradas</p>
        </div>
        <GlobalButton
          leftIcon={<Plus size={15} />}
          onClick={() => { resetForm(); setCreateOpen(true); }}
        >
          Nova Categoria
        </GlobalButton>
      </div>

      <div className="space-y-3">
        {categorias.map((cat) => (
          <div key={cat.id} className="card overflow-hidden">
            <div
              className="flex items-center gap-4 p-4 cursor-pointer"
              onClick={() => toggleExpand(cat)}
            >
              {cat.foto ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <NextImage src={cat.foto} alt={cat.nome} width={40} height={40} className="object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--blue-50)", color: "var(--blue-600)" }}>
                  <ImageIcon size={16} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{cat.nome}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{cat.descricao}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditTarget(cat); setNome(cat.nome); setDescricao(cat.descricao); }}
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
                {expandedId === cat.id ? <ChevronUp size={14} style={{ color: "var(--text-3)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-3)" }} />}
              </div>
            </div>

            {expandedId === cat.id && (
              <div className="border-t" style={{ borderColor: "var(--border)", background: "var(--gray-25)" }}>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
                      Subcategorias
                    </p>
                    <button
                      onClick={() => { resetForm(); setCreateSubFor(cat); }}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                      style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}
                    >
                      <Plus size={11} /> Adicionar
                    </button>
                  </div>

                  {loadingSubId === cat.id ? (
                    <div className="space-y-2">
                      {[1,2].map((i) => <div key={i} className="skeleton h-8 rounded-lg" />)}
                    </div>
                  ) : (subcategorias[cat.id] ?? []).length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: "var(--text-3)" }}>Nenhuma subcategoria</p>
                  ) : (
                    (subcategorias[cat.id] ?? []).map((sub) => (
                      <div key={sub.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <p className="flex-1 text-sm" style={{ color: "var(--text)" }}>{sub.nome}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}>
                          {sub.tipo === 1 ? "Serviço" : "Espaço"}
                        </span>
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

      {/* Modal Criar/Editar Categoria */}
      <GlobalModal
        open={createOpen || !!editTarget}
        onOpenChange={(o) => { if (!o) { setCreateOpen(false); setEditTarget(null); resetForm(); } }}
        title={editTarget ? "Editar Categoria" : "Nova Categoria"}
        size="sm"
        footer={
          <>
            <GlobalButton variant="outline" onClick={() => { setCreateOpen(false); setEditTarget(null); resetForm(); }}>Cancelar</GlobalButton>
            <GlobalButton onClick={editTarget ? handleEdit : handleCreate} loading={isPending}>
              {editTarget ? "Salvar" : "Criar"}
            </GlobalButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlobalInput id="cat-nome" label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Espaços de Eventos" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full text-sm rounded-lg px-3.5 py-2.5 border outline-none resize-none transition-all"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          {!editTarget && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Foto</label>
              {fotoPreview && (
                <div className="w-full h-32 rounded-lg overflow-hidden mb-2">
                  <NextImage src={fotoPreview} alt="Preview" width={300} height={128} className="object-cover w-full h-full" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm w-full" />
            </div>
          )}
        </div>
      </GlobalModal>

      {/* Modal Criar Subcategoria */}
      <GlobalModal
        open={!!createSubFor}
        onOpenChange={(o) => { if (!o) { setCreateSubFor(null); resetForm(); } }}
        title={`Nova Subcategoria — ${createSubFor?.nome}`}
        size="sm"
        footer={
          <>
            <GlobalButton variant="outline" onClick={() => { setCreateSubFor(null); resetForm(); }}>Cancelar</GlobalButton>
            <GlobalButton onClick={handleCreateSub} loading={isPending}>Criar</GlobalButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlobalInput id="sub-nome" label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="w-full text-sm rounded-lg px-3.5 py-2.5 border outline-none resize-none"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Foto</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm w-full" />
          </div>
        </div>
      </GlobalModal>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remover categoria?"
        description={`A categoria "${deleteTarget?.nome}" e todas as subcategorias serão removidas permanentemente.`}
        onConfirm={handleDelete}
        loading={isPending}
        confirmLabel="Remover"
      />
    </div>
  );
}
