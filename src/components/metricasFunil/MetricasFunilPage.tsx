"use client";
import { useSearchParams } from "next/navigation";
import { Clock, Percent, Receipt, Wallet } from "lucide-react";
import type { ActionResult } from "@/types/common.types";
import type { AnuncioContagem, FluxoMetricas, MetricasFunil } from "@/types/metricasFunil.types";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { ErroCarregamento } from "@/components/global/FiltrosUI";
import { Cartao, CamposPeriodo, Etiqueta, Numero, Vazio } from "@/components/admin/AdminUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { formatCurrencyAOA } from "@/lib/utils";

/*
 * Funil de reservas: compara os fluxos da app (planear, orçamento, reserva avulsa…) desde o
 * primeiro passo até à reserva paga. A app manda os passos; o back-end grava a reserva criada.
 */

const NOME_FLUXO: Record<string, string> = {
  planear: "Planear",
  orcamento: "Orçamento",
  avulsa: "Reserva avulsa",
  promocao: "Promoção",
  colecao: "Coleção",
};

/** Ordem dos passos de cada fluxo (os que não estão aqui vão para o fim). */
const ORDEM_PASSOS: Record<string, string[]> = {
  planear: ["inicio", "selecionando_espaco", "selecionando_servicos", "resumo", "reservou"],
  orcamento: ["explicacao", "agendar", "adicionou", "juntar_direto", "abriu", "reservar", "reservou"],
  avulsa: ["inicio", "resumo", "reservou"],
};

const NOME_PASSO: Record<string, string> = {
  inicio: "Começou",
  selecionando_espaco: "A escolher o espaço",
  selecionando_servicos: "A escolher os serviços",
  resumo: "Viu o resumo",
  reservou: "Reservou",
  explicacao: "Viu a explicação",
  agendar: "Tocou no botão do orçamento",
  adicionou: "Juntou um item",
  juntar_direto: "Juntou com um toque",
  abriu: "Abriu o orçamento",
  reservar: "Tocou em Reservar",
};

const num = (v: number) => v.toLocaleString("pt-AO");
const pct = (v: number | null) => (v == null ? "—" : `${v.toLocaleString("pt-AO", { maximumFractionDigits: 1 })}%`);

function tempo(minutos: number | null) {
  if (minutos == null) return "—";
  if (minutos < 60) return `${Math.round(minutos)} min`;
  const horas = minutos / 60;
  if (horas < 48) return `${horas.toLocaleString("pt-AO", { maximumFractionDigits: 1 })} h`;
  return `${Math.round(horas / 24)} dias`;
}

export function MetricasFunilPage({ metricas }: { metricas: ActionResult<MetricasFunil> }) {
  const { atualizar, recarregar, isPending } = useFiltrosUrl();
  const sp = useSearchParams();
  const m = metricas.success ? metricas.data : null;
  const de = sp.get("de") ?? m?.inicio;
  const ate = sp.get("ate") ?? m?.fim;

  return (
    <PageShell
      title="Funil de reservas"
      subtitle="Que caminho leva mais clientes a reservar? Cada tentativa conta pela data em que aconteceu."
      actions={
        <div className="flex flex-wrap items-center gap-2" style={{ opacity: isPending ? 0.6 : 1 }}>
          <CamposPeriodo de={de} ate={ate} onChange={(mud) => atualizar({ de, ate, ...mud })} />
        </div>
      }
    >
      {!m ? <ErroCarregamento mensagem={metricas.success ? "" : metricas.error} onRetry={recarregar} /> : <Conteudo m={m} />}
    </PageShell>
  );
}

function Conteudo({ m }: { m: MetricasFunil }) {
  const fluxo = (nome: string) => m.fluxos.find((f) => f.fluxo === nome);
  const planear = fluxo("planear");
  const orcamento = fluxo("orcamento");
  const comDados = m.fluxos.filter((f) => f.jornadas > 0 || f.reservas > 0);
  const reservas = m.fluxos.reduce((s, f) => s + f.reservas, 0);
  const valor = m.fluxos.reduce((s, f) => s + f.valorReservado, 0);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard label="Conversão no Planear" value={pct(planear?.conversao ?? null)} icon={<Percent size={16} />} accent />
        <KPICard label="Conversão no Orçamento" value={pct(orcamento?.conversao ?? null)} icon={<Percent size={16} />} />
        <KPICard label={`Reservas (${formatCurrencyAOA(valor)})`} value={num(reservas)} icon={<Receipt size={16} />} />
        <KPICard
          label="Tempo até reservar (Planear / Orçamento)"
          value={`${tempo(planear?.minutosAteReservar ?? null)} / ${tempo(orcamento?.minutosAteReservar ?? null)}`}
          icon={<Clock size={16} />}
        />
      </div>

      {comDados.length === 0 && (
        <p className="text-sm rounded-lg p-3" style={{ background: "var(--surface-2, var(--surface))", border: "1px solid var(--border)", color: "var(--text-2)" }}>
          Ainda não há passos registados neste período. A app só os envia a partir da versão com o orçamento: quem ainda não atualizou não aparece aqui.
        </p>
      )}

      <Cartao titulo="Fluxos lado a lado">
        <Tabela
          cabecalho={["Fluxo", "Tentativas", "Reservas", "Conversão", "Confirmadas", "Pagas", "Canceladas", "Valor reservado", "Ticket médio", "Tempo até reservar"]}
          direita={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
          linhas={m.fluxos.map((f) => [
            <span key="f" className="font-medium">{NOME_FLUXO[f.fluxo] ?? f.fluxo}</span>,
            <Numero key="j" valor={f.jornadas} />,
            <Numero key="r" valor={f.reservas} />,
            <span key="c" className="block text-right">{pct(f.conversao)}</span>,
            <Numero key="cf" valor={f.confirmadas} />,
            <Numero key="p" valor={f.pagas} />,
            <Numero key="cn" valor={f.canceladas} />,
            <span key="v" className="block text-right whitespace-nowrap">{formatCurrencyAOA(f.valorReservado)}</span>,
            <span key="t" className="block text-right whitespace-nowrap">{f.reservas ? formatCurrencyAOA(f.ticketMedio) : "—"}</span>,
            <span key="m" className="block text-right whitespace-nowrap">{tempo(f.minutosAteReservar)}</span>,
          ])}
        />
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          Na reserva avulsa, na promoção e na coleção só há tentativas a partir da versão da app com o funil; as reservas contam sempre.
        </p>
      </Cartao>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {planear && <CartaoPassos fluxo={planear} />}
        {orcamento && <CartaoPassos fluxo={orcamento} />}
      </div>

      <Cartao titulo="Orçamentos">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Resumo rotulo="Criados" valor={num(m.orcamento.criados)} />
          <Resumo rotulo="Reservados" valor={num(m.orcamento.reservados)} />
          <Resumo rotulo="Abandonados (7 dias)" valor={num(m.orcamento.abandonados)} />
          <Resumo rotulo="Itens juntados" valor={num(m.orcamento.itensAdicionados)} />
          <Resumo rotulo="Itens removidos" valor={num(m.orcamento.itensRemovidos)} />
          <Resumo
            rotulo="Itens por orçamento reservado"
            valor={m.orcamento.itensPorOrcamentoReservado == null ? "—" : m.orcamento.itensPorOrcamentoReservado.toLocaleString("pt-AO")}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          <ListaAnuncios titulo="Mais juntados" itens={m.orcamento.maisAdicionados} />
          <ListaAnuncios titulo="Mais removidos" itens={m.orcamento.maisRemovidos} />
        </div>
      </Cartao>

      <p className="text-xs" style={{ color: "var(--text-3)" }}>
        Como se conta: cada tentativa é uma jornada (no Planear, a sessão do plano; no Orçamento, desde o primeiro item até reservar).
        Conversão = tentativas que reservaram ÷ tentativas. Numa reserva com vários parceiros contam o pedido inteiro: confirmada quando
        todas as partes ativas confirmaram, paga quando o pedido foi pago. &quot;Abandonado&quot; é um orçamento aberto, com itens, sem mexer há 7 dias.
      </p>
    </>
  );
}

/** Funil de um fluxo: quantas tentativas chegaram a cada passo, em barras relativas ao primeiro. */
function CartaoPassos({ fluxo }: { fluxo: FluxoMetricas }) {
  const ordem = ORDEM_PASSOS[fluxo.fluxo] ?? [];
  const passos = [...fluxo.passos].sort((a, b) => {
    const ia = ordem.indexOf(a.passo), ib = ordem.indexOf(b.passo);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || b.jornadas - a.jornadas;
  });
  const topo = Math.max(1, ...passos.map((p) => p.jornadas));

  return (
    <Cartao titulo={`Passos — ${NOME_FLUXO[fluxo.fluxo] ?? fluxo.fluxo}`} acao={<Etiqueta tom="info">{num(fluxo.jornadas)} tentativas</Etiqueta>}>
      {passos.length === 0 ? (
        <Vazio mensagem="Sem passos neste período." />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {passos.map((p) => (
            <li key={p.passo} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm" style={{ color: "var(--text)" }}>
                <span>{NOME_PASSO[p.passo] ?? p.passo}</span>
                <span className="flex items-baseline gap-2" style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-2)" }}>
                  {num(p.jornadas)}
                  <span className="text-xs w-9 text-right" style={{ color: "var(--text-3)" }}>
                    {Math.round((100 * p.jornadas) / topo)}%
                  </span>
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full" style={{ width: `${(100 * p.jornadas) / topo}%`, background: "var(--blue)" }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  );
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg p-3" style={{ border: "1px solid var(--border)" }}>
      <p className="text-xs" style={{ color: "var(--text-3)" }}>{rotulo}</p>
      <p className="text-lg font-semibold" style={{ color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{valor}</p>
    </div>
  );
}

function ListaAnuncios({ titulo, itens }: { titulo: string; itens: AnuncioContagem[] }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>{titulo}</p>
      {itens.length === 0 ? (
        <Vazio mensagem="Nada neste período." />
      ) : (
        <Tabela
          cabecalho={["Anúncio", "Tipo", "Vezes"]}
          direita={[2]}
          linhas={itens.map((a) => [
            a.nome,
            <Etiqueta key="t" tom="neutro">{a.tipo === "espaco" ? "Espaço" : "Serviço"}</Etiqueta>,
            <Numero key="v" valor={a.vezes} />,
          ])}
        />
      )}
    </div>
  );
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
