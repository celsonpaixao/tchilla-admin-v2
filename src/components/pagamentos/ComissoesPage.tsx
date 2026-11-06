"use client";
import { useEffect, useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { ComissaoInterface, Paginado, ResumoFinanceiro } from "@/types/payment.types";
import { confirmarComissao } from "@/actions/payment.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { StatusBadge } from "@/components/global/StatusBadge";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { GlobalButton } from "@/components/global/GlobalButton";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { formatCurrencyAOA, formatDatetime } from "@/lib/utils";
import { Clock, Wallet } from "lucide-react";
import { TABS_COMISSOES, type TabComissoes } from "./filtros";
import { ErroCarregamento, FilterTabs } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { Kz, LinkDocumento, kzCompacto } from "./FinanceiroUI";

interface ComissoesPageProps {
  tab: TabComissoes;
  lista: ActionResult<Paginado<ComissaoInterface>>;
  resumo: ActionResult<ResumoFinanceiro>;
  porConfirmar: number;
}

function vazio(tab: TabComissoes) {
  switch (tab) {
    case "por-confirmar": return "Nenhuma comissão por confirmar. Quando um parceiro enviar o comprovativo do pagamento da comissão, aparece aqui.";
    case "pendentes": return "Nenhuma comissão pendente.";
    case "pagas": return "Ainda não há comissões pagas.";
    case "canceladas": return "Nenhuma comissão cancelada.";
    default: return "Ainda não há comissões. São criadas quando um cliente paga uma reserva por transferência.";
  }
}

export function ComissoesPage({ tab, lista, resumo, porConfirmar }: ComissoesPageProps) {
  const { atualizar, recarregar, isPending } = useFiltrosUrl();
  const [comissoes, setComissoes] = useState<ComissaoInterface[]>(lista.success ? lista.data.data : []);
  const [alvo, setAlvo] = useState<ComissaoInterface | null>(null);
  const [aGravar, startGravar] = useTransition();

  useEffect(() => {
    setComissoes(lista.success ? lista.data.data : []);
  }, [lista]);

  const pagina = lista.success ? lista.data : null;
  const r = resumo.success ? resumo.data : null;

  function confirmar() {
    if (!alvo) return;
    const c = alvo;
    startGravar(async () => {
      const res = await confirmarComissao(c.id);
      if (!res.success) {
        toast.error("Não foi possível confirmar a comissão", { description: res.error });
        return;
      }
      setComissoes((prev) => prev.map((x) => (x.id === c.id ? { ...x, estado: "Pago" } : x)));
      setAlvo(null);
      toast.success(`Comissão #${c.id} confirmada`, { description: `${formatCurrencyAOA(c.valor)} de ${c.agencia ?? "parceiro"}.` });
      recarregar();
    });
  }

  const columns: ColumnDef<ComissaoInterface, unknown>[] = [
    {
      accessorKey: "id",
      header: "Comissão",
      cell: ({ getValue }) => (
        <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-2)" }}>#{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "agencia",
      header: "Parceiro",
      cell: ({ row }) => (
        <span className="font-medium" style={{ color: "var(--text)" }}>
          {row.original.agencia || (row.original.agenciaId ? `Agência #${row.original.agenciaId}` : "Sem parceiro")}
        </span>
      ),
    },
    {
      id: "reserva",
      header: "Reserva",
      cell: ({ row }) => (
        <div>
          <p>Reserva #{row.original.reservaId}</p>
          {row.original.tipoReserva && <p className="text-xs" style={{ color: "var(--text-3)" }}>{row.original.tipoReserva}</p>}
        </div>
      ),
    },
    {
      accessorKey: "valor",
      header: () => <span className="block w-full text-right">Valor</span>,
      cell: ({ row }) => (
        <div>
          <Kz valor={row.original.valor} forte />
          <p className="text-xs text-right" style={{ color: "var(--text-3)" }}>{row.original.percentual}% da reserva</p>
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      accessorKey: "criadoEm",
      header: "Criada",
      cell: ({ getValue }) => <span className="whitespace-nowrap">{formatDatetime(getValue() as string)}</span>,
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {c.comprovativoParceiro && (
              <LinkDocumento href={c.comprovativoParceiro} label={`Ver comprovativo da comissão #${c.id}`} icon={<FileText size={15} />} />
            )}
            {c.estado === "Pendente" && c.parceiroEnviouComprovativo && (
              <GlobalButton size="sm" variant="secondary" onClick={() => setAlvo(c)}>Confirmar recebimento</GlobalButton>
            )}
            {c.estado === "Pendente" && !c.parceiroEnviouComprovativo && (
              <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-3)" }}>À espera do parceiro</span>
            )}
          </div>
        );
      },
    },
  ];

  const pendentes = r ? kzCompacto(r.comissoesPendentes.valor) : null;
  const pagas = r ? kzCompacto(r.comissoesPagas.valor) : null;

  return (
    <PageShell
      title="Comissões"
      subtitle="Comissões das reservas pagas por transferência — o parceiro paga à Tchilla e a equipa confirma."
    >
      {r ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <KPICard label={`Por receber · ${r.comissoesPendentes.quantidade}`} value={pendentes!.valor} suffix={pendentes!.sufixo} icon={<Clock size={16} />} />
          <KPICard label={`Recebidas · ${r.comissoesPagas.quantidade}`} value={pagas!.valor} suffix={pagas!.sufixo} icon={<Wallet size={16} />} />
          <KPICard label="Por confirmar" value={porConfirmar} icon={<FileText size={16} />} />
        </div>
      ) : (
        !resumo.success && <ErroCarregamento mensagem={resumo.error} onRetry={recarregar} />
      )}

      <FilterTabs
        tabs={TABS_COMISSOES}
        ativa={tab}
        onChange={(id) => atualizar({ tab: id === "por-confirmar" ? undefined : id })}
        contadores={{ "por-confirmar": porConfirmar }}
      />

      {!lista.success ? (
        <ErroCarregamento mensagem={lista.error} onRetry={recarregar} />
      ) : (
        <GlobalTable
          data={comissoes}
          columns={columns}
          isLoading={isPending}
          emptyMessage={vazio(tab)}
          serverPagination={{
            page: pagina!.pageNumber,
            pageSize: pagina!.pageSize,
            totalItems: pagina!.totalItems,
            totalPages: pagina!.totalPages,
            onPageChange: (p) => atualizar({ pagina: p > 1 ? p : undefined }),
          }}
          toolbar={
            <p className="text-xs" style={{ color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
              {pagina!.totalItems} {pagina!.totalItems === 1 ? "comissão" : "comissões"}
            </p>
          }
        />
      )}

      <ConfirmModal
        open={!!alvo}
        onOpenChange={(o) => !o && setAlvo(null)}
        title={alvo ? `Confirmar a comissão #${alvo.id}?` : ""}
        description={
          alvo
            ? `${formatCurrencyAOA(alvo.valor)} de ${alvo.agencia ?? "parceiro"} (reserva #${alvo.reservaId}) passa a paga. Confirma só depois de ver o dinheiro na conta da Tchilla.`
            : ""
        }
        onConfirm={confirmar}
        loading={aGravar}
        confirmLabel="Confirmar recebimento"
        confirmVariant="primary"
      />
    </PageShell>
  );
}
