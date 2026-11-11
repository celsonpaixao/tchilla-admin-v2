"use client";
import { Coins, Handshake, Hourglass, Wallet } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { ParceiroFinanceiro } from "@/types/admin.types";
import { GlobalTable } from "@/components/global/GlobalTable";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { ErroCarregamento } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { CamposPeriodo, LinkInterno, Numero, Vazio, nomeParceiroResumo } from "@/components/admin/AdminUI";
import { ROUTES } from "@/constants/routes";
import { Kz, kzCompacto } from "./FinanceiroUI";

export function FinanceiroParceirosPage({ periodo, lista }: { periodo: { de?: string; ate?: string }; lista: ActionResult<ParceiroFinanceiro[]> }) {
  const { atualizar, recarregar, isPending } = useFiltrosUrl();
  const dados = lista.success ? lista.data : [];
  const soma = (f: (p: ParceiroFinanceiro) => number) => dados.reduce((s, p) => s + f(p), 0);
  const faturado = kzCompacto(soma((p) => p.valorReservasPagas));
  const split = kzCompacto(soma((p) => p.recebidoSplit));
  const comissaoSplit = kzCompacto(soma((p) => p.comissaoSplit));
  const pendentes = soma((p) => p.comissoesPendentes.valor);

  const columns: ColumnDef<ParceiroFinanceiro, unknown>[] = [
    {
      id: "parceiro",
      header: "Parceiro",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[220px]">
          <p className="font-medium truncate" style={{ color: "var(--text)" }}>{nomeParceiroResumo(row.original.parceiro)}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{row.original.parceiro.tipo ?? "—"}</p>
        </div>
      ),
    },
    {
      accessorKey: "reservas",
      header: () => <span className="block w-full text-right">Reservas</span>,
      cell: ({ row }) => (
        <span className="block text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
          <LinkInterno href={`${ROUTES.RESERVAS.LISTAGEM}?agencia=${row.original.parceiro.id}`}>{row.original.reservas}</LinkInterno>
          <span className="text-xs ml-1" style={{ color: "var(--text-3)" }}>({row.original.reservasPagas} pagas)</span>
        </span>
      ),
    },
    { accessorKey: "valorReservasPagas", header: () => <span className="block w-full text-right">Valor pago</span>, cell: ({ row }) => <Kz valor={row.original.valorReservasPagas} forte /> },
    { accessorKey: "recebidoSplit", header: () => <span className="block w-full text-right">Recebeu no split</span>, cell: ({ row }) => <Kz valor={row.original.recebidoSplit} /> },
    { accessorKey: "comissaoSplit", header: () => <span className="block w-full text-right">Comissão no split</span>, cell: ({ row }) => <Kz valor={row.original.comissaoSplit} /> },
    {
      id: "comissoes",
      header: () => <span className="block w-full text-right">Comissões por pagar</span>,
      cell: ({ row }) => row.original.comissoesPendentes.quantidade > 0 ? (
        <span className="block text-right">
          <LinkInterno href={`${ROUTES.FINANCEIRO.COMISSOES}?tab=pendentes`}>{row.original.comissoesPendentes.quantidade}</LinkInterno>
          <Kz valor={row.original.comissoesPendentes.valor} />
        </span>
      ) : <Numero valor={0} />,
    },
  ];

  return (
    <PageShell
      title="Financeiro por parceiro"
      subtitle="Uma reserva com vários parceiros conta para cada um. O split só existe quando a reserva tem um único parceiro com IBAN e NIF."
    >
      {lista.success && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label={`Reservas pagas · ${dados.length} ${dados.length === 1 ? "parceiro" : "parceiros"}`} value={faturado.valor} suffix={faturado.sufixo} icon={<Handshake size={16} />} />
          <KPICard label="Recebido pelos parceiros no split" value={split.valor} suffix={split.sufixo} icon={<Wallet size={16} />} />
          <KPICard label="Comissão Tchilla no split" value={comissaoSplit.valor} suffix={comissaoSplit.sufixo} icon={<Coins size={16} />} />
          <KPICard label="Comissões de transferências por pagar" value={kzCompacto(pendentes).valor} suffix={kzCompacto(pendentes).sufixo} icon={<Hourglass size={16} />} />
        </div>
      )}

      {!lista.success ? (
        <ErroCarregamento mensagem={lista.error} onRetry={recarregar} />
      ) : (
        <GlobalTable
          data={dados}
          columns={columns}
          isLoading={isPending}
          searchPlaceholder="Procurar parceiro…"
          emptyMessage={<Vazio mensagem={periodo.de || periodo.ate ? "Nenhum parceiro teve atividade neste período." : "Ainda não há reservas nem pagamentos com parceiros."} onLimpar={periodo.de || periodo.ate ? () => atualizar({ de: undefined, ate: undefined }) : undefined} />}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <CamposPeriodo rotulo="Criado" de={periodo.de} ate={periodo.ate} onChange={(m) => atualizar(m)} />
            </div>
          }
        />
      )}
    </PageShell>
  );
}
