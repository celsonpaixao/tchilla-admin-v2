"use client";
import { Clock, Flag, Inbox, Sparkles } from "lucide-react";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { ContadoresPosts, ContestacaoAdmin, DestaqueAdmin, FiltroPostsAdmin, PostAdmin } from "@/types/publicacao.types";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { ErroCarregamento, FilterTabs } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import type { Vista } from "./filtros";
import { RevisaoLista } from "./RevisaoLista";
import { PostsTabela } from "./PostsTabela";
import { ContestacoesTabela } from "./ContestacoesTabela";
import { DestaquesLista } from "./DestaquesLista";

const ABAS: { id: Vista; label: string }[] = [
  { id: "rever", label: "Para rever" },
  { id: "publicadas", label: "Publicadas" },
  { id: "retiradas", label: "Retiradas" },
  { id: "contestacoes", label: "Contestações" },
  { id: "destaques", label: "Destaques da home" },
];

interface PublicacoesPageProps {
  vista: Vista;
  filtro: FiltroPostsAdmin;
  estadoContestacao: string;
  contadores: ActionResult<ContadoresPosts>;
  posts: ActionResult<Paginado<PostAdmin>> | null;
  contestacoes: ActionResult<Paginado<ContestacaoAdmin>> | null;
  destaques: ActionResult<DestaqueAdmin[]> | null;
}

/*
 * Camada social: o que a equipa decide sobre as publicações.
 * Posts de clientes só aparecem na app depois de aprovados aqui (prazo interno de 24h);
 * posts de parceiros publicam logo e só se retiram em casos claros.
 */
export function PublicacoesPage({ vista, filtro, estadoContestacao, contadores, posts, contestacoes, destaques }: PublicacoesPageProps) {
  const { atualizar, recarregar } = useFiltrosUrl();
  const c = contadores.success ? contadores.data : null;

  return (
    <PageShell
      title="Publicações"
      subtitle="Fotos e vídeos de parceiros e clientes, ligados aos anúncios. As de clientes só aparecem na app depois de aprovadas aqui (prazo: 24 horas)."
    >
      {c ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label="Para rever" value={c.emRevisao} icon={<Inbox size={16} />} />
          <KPICard label="Fora do prazo (24h)" value={c.prazoEsgotado} icon={<Clock size={16} />} />
          <KPICard label="Contestações abertas" value={c.contestacoesAbertas} icon={<Flag size={16} />} />
          <KPICard label="Destaques na home" value={c.destaquesAtivos} icon={<Sparkles size={16} />} accent />
        </div>
      ) : (
        !contadores.success && <ErroCarregamento mensagem={contadores.error} onRetry={recarregar} />
      )}

      <FilterTabs
        tabs={ABAS}
        ativa={vista}
        contadores={{ rever: c?.emRevisao, contestacoes: c?.contestacoesAbertas }}
        onChange={(id) => atualizar({ vista: id === "rever" ? undefined : id, q: undefined, autor: undefined, estado: undefined, cestado: undefined })}
      />

      {vista === "rever" && posts && <RevisaoLista posts={posts} filtro={filtro} />}
      {(vista === "publicadas" || vista === "retiradas") && posts && <PostsTabela vista={vista} posts={posts} filtro={filtro} />}
      {vista === "contestacoes" && contestacoes && <ContestacoesTabela contestacoes={contestacoes} estado={estadoContestacao} />}
      {vista === "destaques" && destaques && <DestaquesLista destaques={destaques} />}
    </PageShell>
  );
}
