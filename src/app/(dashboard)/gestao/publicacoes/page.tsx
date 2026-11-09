import type { Metadata } from "next";
import { fetchContadoresPosts, fetchContestacoes, fetchDestaques, fetchPostsAdmin } from "@/actions/publicacao.actions";
import { PublicacoesPage } from "@/components/publicacoes/PublicacoesPage";
import { estadoContestacao, filtroPosts, vista } from "@/components/publicacoes/filtros";
import { PAGE_SIZE, pagina, type SearchParams } from "@/components/admin/params";

export const metadata: Metadata = { title: "Gestão — Publicações" };

export default async function PublicacoesPageRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const v = vista(params);
  const filtro = filtroPosts(params);
  const cestado = estadoContestacao(params);

  const [contadores, posts, contestacoes, destaques] = await Promise.all([
    fetchContadoresPosts(),
    v === "rever" || v === "publicadas" || v === "retiradas" ? fetchPostsAdmin(filtro) : null,
    v === "contestacoes"
      ? fetchContestacoes({ estado: cestado === "todas" ? undefined : cestado, pagina: pagina(params.pagina), tamanho: PAGE_SIZE })
      : null,
    v === "destaques" ? fetchDestaques() : null,
  ]);

  return (
    <PublicacoesPage
      vista={v}
      filtro={filtro}
      estadoContestacao={cestado}
      contadores={contadores}
      posts={posts}
      contestacoes={contestacoes}
      destaques={destaques}
    />
  );
}
