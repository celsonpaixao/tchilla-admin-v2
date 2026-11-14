"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Handshake, MousePointerClick, Receipt, TrendingUp } from "lucide-react";
import type { ActionResult } from "@/types/common.types";
import type { GrupoAnuncios, MetricasSociais } from "@/types/metricasSociais.types";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { ErroCarregamento, ToolbarSelect } from "@/components/global/FiltrosUI";
import { Cartao, CamposPeriodo, DataCurta, Etiqueta, Numero, Vazio } from "@/components/admin/AdminUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { formatCurrencyAOA } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

/*
 * Métricas combinadas para a camada social (CAMADA_SOCIAL_APP.md, secção 3).
 * De propósito sem totais de posts nem de visualizações: são métricas de vaidade.
 */

const JANELAS = [3, 7, 14, 30];

const num = (v: number) => v.toLocaleString("pt-AO");
const pct = (v: number) => v.toLocaleString("pt-AO", { maximumFractionDigits: 1 });

export function MetricasSociaisPage({ metricas }: { metricas: ActionResult<MetricasSociais> }) {
  const { atualizar, recarregar, isPending } = useFiltrosUrl();
  const sp = useSearchParams();
  const m = metricas.success ? metricas.data : null;
  const de = sp.get("de") ?? m?.inicio;
  const ate = sp.get("ate") ?? m?.fim;
  const janela = m?.janelaDias ?? 7;

  return (
    <PageShell
      title="Camada social"
      subtitle="As publicações estão a levar a reservas? Os pedidos de reserva contam pela data em que foram feitos."
      actions={
        <div className="flex flex-wrap items-center gap-2" style={{ opacity: isPending ? 0.6 : 1 }}>
          <CamposPeriodo de={de} ate={ate} onChange={(mud) => atualizar({ de, ate, ...mud })} />
          <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
            Janela
            <ToolbarSelect value={janela} onChange={(e) => atualizar({ janela: e.target.value })} aria-label="Janela de atribuição">
              {JANELAS.map((d) => <option key={d} value={d}>{d} dias</option>)}
            </ToolbarSelect>
          </label>
        </div>
      }
    >
      {!m ? (
        <ErroCarregamento mensagem={metricas.success ? "" : metricas.error} onRetry={recarregar} />
      ) : (
        <Conteudo m={m} />
      )}
    </PageShell>
  );
}

function Conteudo({ m }: { m: MetricasSociais }) {
  const { parceiros, anuncios, atribuicao } = m;
  const semDados = anuncios.comPosts.visualizacoes + anuncios.semPosts.visualizacoes === 0 && atribuicao.cliquesReservarDePosts === 0;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={`Parceiros ativos com posts (${num(parceiros.comPost)} de ${num(parceiros.ativos)})`}
          value={pct(parceiros.percentagem)}
          suffix="%"
          icon={<Handshake size={16} />}
          accent
        />
        <KPICard
          label="Pedidos por 100 visitas, com posts"
          value={pct(anuncios.comPosts.pedidosPor100Visualizacoes)}
          icon={<TrendingUp size={16} />}
        />
        <KPICard
          label="Pedidos por 100 visitas, sem posts"
          value={pct(anuncios.semPosts.pedidosPor100Visualizacoes)}
          icon={<TrendingUp size={16} />}
        />
        <KPICard
          label={`Reservas vindas de posts (${num(atribuicao.validadas)} concluídas e pagas)`}
          value={num(atribuicao.reservas)}
          icon={<Receipt size={16} />}
        />
      </div>

      {semDados && (
        <p className="text-sm rounded-lg p-3" style={{ background: "var(--surface-2, var(--surface))", border: "1px solid var(--border)", color: "var(--text-2)" }}>
          Ainda não há visitas nem cliques registados neste período. A app só os envia a partir da versão com as publicações:
          quem ainda não atualizou não aparece aqui.
        </p>
      )}

      <Cartao titulo="Anúncios com posts e sem posts">
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          Só entram os anúncios abertos na app no período. &quot;Com posts&quot; quer dizer que o anúncio tinha uma publicação visível antes do fim do período.
        </p>
        <Tabela
          cabecalho={["", "Anúncios vistos", "Visitas", "Pedidos de reserva", "Pedidos por 100 visitas"]}
          direita={[1, 2, 3, 4]}
          linhas={[
            linhaGrupo("Com posts", anuncios.comPosts),
            linhaGrupo("Sem posts", anuncios.semPosts),
          ]}
        />
      </Cartao>

      <Cartao titulo={`Publicações que levaram a reservas (janela de ${m.janelaDias} dias)`}>
        <p className="text-xs flex flex-wrap gap-x-4" style={{ color: "var(--text-3)" }}>
          <span><MousePointerClick size={12} className="inline -mt-0.5" /> {num(atribuicao.cliquesReservarDePosts)} toques em &quot;Reservar&quot; a partir de publicações</span>
          <span>Valor das reservas: {formatCurrencyAOA(atribuicao.valorReservas)}</span>
        </p>
        {atribuicao.posts.length === 0 ? (
          <Vazio mensagem={"Nenhum toque em \"Reservar\" a partir de publicações neste período."} />
        ) : (
          <Tabela
            cabecalho={["Publicação", "Autor", "Toques em Reservar", "Reservas", "Valor"]}
            direita={[2, 3, 4]}
            linhas={atribuicao.posts.map((p) => [
              <span key="id" style={{ fontVariantNumeric: "tabular-nums" }}>#{p.postId}</span>,
              <span key="autor" className="flex flex-wrap items-center gap-2">
                {p.autor ?? "—"}
                <Etiqueta tom={p.doParceiro ? "info" : "neutro"}>{p.doParceiro ? "Parceiro" : "Cliente"}</Etiqueta>
              </span>,
              <Numero key="c" valor={p.cliques} />,
              <Numero key="r" valor={p.reservas} />,
              <span key="v" className="block text-right whitespace-nowrap">{formatCurrencyAOA(p.valor)}</span>,
            ])}
          />
        )}
      </Cartao>

      <Cartao titulo="Últimas reservas atribuídas">
        {atribuicao.ultimas.length === 0 ? (
          <Vazio mensagem="Nenhuma reserva atribuída a publicações neste período." />
        ) : (
          <Tabela
            cabecalho={["Reserva", "Anúncio", "Publicação", "Toque em Reservar", "Reserva feita", "Estado", "Valor"]}
            direita={[6]}
            linhas={atribuicao.ultimas.map((r) => [
              <Link key="id" href={ROUTES.RESERVAS.DETALHE(r.reservaId)} className="underline" style={{ color: "var(--blue)" }}>#{r.reservaId}</Link>,
              r.anuncio,
              `#${r.postId}`,
              <DataCurta key="c" valor={r.cliqueEm} comHora />,
              <DataCurta key="f" valor={r.criadaEm} comHora />,
              <span key="e" className="flex flex-wrap gap-1">
                {r.status}
                {r.pago && <Etiqueta tom="sucesso">Paga</Etiqueta>}
              </span>,
              <span key="v" className="block text-right whitespace-nowrap">{formatCurrencyAOA(r.valor)}</span>,
            ])}
          />
        )}
      </Cartao>

      <p className="text-xs" style={{ color: "var(--text-3)" }}>
        Como se conta: uma reserva vem de uma publicação quando a mesma conta tocou em &quot;Reservar&quot; nesse anúncio a partir da publicação,
        até {m.janelaDias} dias antes de reservar. Fica o último toque. Não conta quando quem reserva é o autor da publicação, nem os toques feitos sem sessão.
        &quot;Parceiro ativo&quot; quer dizer uma agência aprovada com pelo menos um espaço publicado, um combo ativo ou um serviço.
      </p>
    </>
  );
}

function linhaGrupo(rotulo: string, g: GrupoAnuncios): React.ReactNode[] {
  return [
    <span key="r" className="font-medium">{rotulo}</span>,
    <Numero key="a" valor={g.anuncios} />,
    <Numero key="v" valor={g.visualizacoes} />,
    <Numero key="p" valor={g.pedidosReserva} />,
    <span key="t" className="block text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{pct(g.pedidosPor100Visualizacoes)}</span>,
  ];
}

/** As colunas em "direita" (números) alinham à direita; as outras à esquerda. */
function Tabela({ cabecalho, linhas, direita }: { cabecalho: string[]; linhas: React.ReactNode[][]; direita: number[] }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {cabecalho.map((c, i) => (
              <th
                key={i}
                className={`px-2 py-2 text-xs font-medium whitespace-nowrap ${direita.includes(i) ? "text-right" : "text-left"}`}
                style={{ color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i}>
              {linha.map((celula, j) => (
                <td key={j} className={`px-2 py-2 ${direita.includes(j) ? "text-right" : "text-left"}`} style={{ color: "var(--text)", borderBottom: "1px solid var(--border)" }}>
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
