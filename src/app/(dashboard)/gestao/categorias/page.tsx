import type { Metadata } from "next";
import { fetchCategorias } from "@/actions/categoria.actions";
import { CategoryPage } from "@/components/categorias/CategoryPage";

export const metadata: Metadata = { title: "Gestão — Categorias" };

export default async function CategoriasPage() {
  const result = await fetchCategorias();
  return <CategoryPage initialCategorias={result.success ? result.data : []} />;
}
