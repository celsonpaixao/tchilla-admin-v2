import type { Metadata } from "next";
import { fetchCategorias, fetchTiposSlug } from "@/actions/categoria.actions";
import { CategoryPage } from "@/components/categorias/CategoryPage";

export const metadata: Metadata = { title: "Gestão — Categorias" };

export default async function CategoriasPage() {
  const [categoriasResult, tiposResult] = await Promise.all([
    fetchCategorias(),
    fetchTiposSlug(),
  ]);

  return (
    <CategoryPage
      initialCategorias={categoriasResult.success ? categoriasResult.data : []}
      slugOptions={tiposResult.success ? tiposResult.data : []}
    />
  );
}
