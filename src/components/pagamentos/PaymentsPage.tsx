"use client";
import { useEffect, useState, useTransition } from "react";
import { BadgeCheck, Clock, FileText, Hourglass, Receipt, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import {
  METODO_LABELS,
  type FiltroPagamentos,
  type PagamentoInterface,
  type Paginado,
  type ResumoFinanceiro,
} from "@/types/payment.types";
import { rejeitarTransferencia, validarTransferencia } from "@/actions/payment.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { StatusBadge } from "@/components/global/StatusBadge";
import { ConfirmModal, GlobalModal } from "@/components/global/GlobalModal";
import { GlobalButton } from "@/components/global/GlobalButton";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { formatCurrencyAOA, formatDate, formatDatetime } from "@/lib/utils";
import { TABS_PAGAMENTOS, type TabPagamentos } from "./filtros";
import { CampoMotivo, ErroCarregamento, FilterTabs, ToolbarInput, ToolbarSelect } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { Kz, LinkDocumento, kzCompacto } from "./FinanceiroUI";

interface PaymentsPageProps {
  tab: TabPagamentos;
  filtro: FiltroPagamentos;
  lista: ActionResult<Paginado<PagamentoInterface>>;
  resumo: ActionResult<ResumoFinanceiro>;
}

const MOTIVO_MIN = 5;

function referenteA(p: PagamentoInterface) {
  if (p.reservaId) return { titulo: `Reserva #${p.reservaId}`, detalhe: p.tipoReserva && p.tipoReserva !== "Reserva" ? p.tipoReserva : null };
  if (p.conviteId) return { titulo: `Convite #${p.conviteId}`, detalhe: "Convite digital" };
  if (p.compraId) return { titulo: `Bilhetes #${p.compraId}`, detalhe: "Compra de bilhetes" };
  return { titulo: "—", detalhe: null };
}

function vazio(tab: TabPagamentos, comFiltros: boolean) {
  if (comFiltros) return "Nenhum pagamento corresponde a estes filtros. Ajusta o método, o período ou a pesquisa.";
  switch (tab) {
    case "por-validar": return "Nenhuma transferência por validar. Quando um cliente enviar um comprovativo, aparece aqui.";
    case "pagos": return "Ainda não há pagamentos confirmados.";
    case "pendentes": return "Não há pagamentos à espera — referências por pagar e transferências por validar aparecem aqui.";
    case "falhados": return "Nenhum pagamento falhado.";
    case "rejeitados": return "Nenhum comprovativo rejeitado.";
    default: return "Ainda não há pagamentos na plataforma.";
  }
}

export function PaymentsPage({ tab, filtro, lista, resumo }: PaymentsPageProps) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [pagamentos, setPagamentos] = useState<PagamentoInterface[]>(lista.success ? lista.data.data : []);
  const [pesquisa, setPesquisa] = useState(filtro.pesquisa ?? "");
  const [validarAlvo, setValidarAlvo] = useState<PagamentoInterface | null>(null);
  const [rejeitarAlvo, setRejeitarAlvo] = useState<PagamentoInterface | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [aGravar, startGravar] = useTransition();

  // Dados novos do servidor (filtro mudou ou refresh) substituem o estado local.
  useEffect(() => {
    setPagamentos(lista.success ? lista.data.data : []);
  }, [lista]);

  // Pesquisa no servidor, 400 ms depois de parar de escrever.
  useEffect(() => {
    const t = setTimeout(() => {
      const atual = queryAtual().get("q") ?? "";
      if (atual !== pesquisa.trim()) atualizar({ q: pesquisa.trim() || undefined });
    }, 400);
    return () => clearTimeout(t);
  }, [pesquisa, atualizar, queryAtual]);

  const pagina = lista.success ? lista.data : null;
  const r = resumo.success ? resumo.data : null;
  const comFiltros = !!(filtro.metodo || filtro.de || filtro.ate || filtro.pesquisa);

  function substituir(atualizado: PagamentoInterface) {
    setPagamentos((prev) => prev.map((p) => (p.id === atualizado.id ? { ...p, ...atualizado } : p)));
  }

  function fecharModais() {
    setValidarAlvo(null);
    setRejeitarAlvo(null);
    setMotivo("");
    setErroAcao(null);
  }

  function confirmarValidacao() {
    if (!validarAlvo) return;
    const alvo = validarAlvo;
    startGravar(async () => {
      const res = await validarTransferencia(alvo.id);
      if (!res.success) {
        setErroAcao(res.error);
        toast.error("Não foi possível validar", { description: res.error });
        return;
      }
      substituir(res.data);
      fecharModais();
      toast.success(`Transferência #${alvo.id} validada`, {
        description: alvo.cliente ? "O cliente e o parceiro foram notificados." : "A reserva ficou marcada como paga.",
      });
      recarregar();
    });
  }

  function confirmarRejeicao() {
    if (!rejeitarAlvo) return;
    const texto = motivo.trim();
    if (texto.length < MOTIVO_MIN) {
      setErroAcao(`Escreve o motivo (pelo menos ${MOTIVO_MIN} caracteres) — o cliente vai lê-lo.`);
      return;
    }
    const alvo = rejeitarAlvo;
    startGravar(async () => {
      const res = await rejeitarTransferencia(alvo.id, texto);
      if (!res.success) {
        setErroAcao(res.error);
        return;
      }
      substituir(res.data);
      fecharModais();
      toast.success(`Comprovativo #${alvo.id} rejeitado`, {
        description: alvo.cliente ? "O cliente recebeu o motivo e pode enviar outro." : "A comissão associada foi cancelada.",
      });
      recarregar();
    });
  }

  const columns: ColumnDef<PagamentoInterface, unknown>[] = [
    {
      accessorKey: "id",
      header: "Nº",
      cell: ({ getValue }) => (
        <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-2)" }}>#{getValue() as number}</span>
      ),
    },
    {
      id: "cliente",
      header: "Cliente",
      cell: ({ row }) => {
        const c = row.original.cliente;
        if (!c) return <span style={{ color: "var(--text-3)" }}>Sem cliente associado</span>;
        return (
          <div className="min-w-0 max-w-[160px]" title={c.email ?? undefined}>
            <p className="font-medium truncate" style={{ color: "var(--text)" }}>{c.nome || `Cliente #${c.id}`}</p>
            {c.email && <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{c.email}</p>}
          </div>
        );
      },
    },
    {
      id: "referente",
      header: "Referente a",
      cell: ({ row }) => {
        const ref = referenteA(row.original);
        return (
          <div>
            <p style={{ color: "var(--text)" }}>{ref.titulo}</p>
            {ref.detalhe && <p className="text-xs" style={{ color: "var(--text-3)" }}>{ref.detalhe}</p>}
          </div>
        );
      },
    },
    {
      accessorKey: "metodoPagamento",
      header: "Método",
      cell: ({ getValue }) => {
        const m = (getValue() as string | null) ?? "";
        return (
          <span className="whitespace-nowrap" title={METODO_LABELS[m]}>
            {m === "MCX" ? "Multicaixa" : METODO_LABELS[m] ?? (m || "—")}
          </span>
        );
      },
    },
    {
      accessorKey: "valor",
      header: () => <span className="block w-full text-right">Valor</span>,
      cell: ({ getValue }) => <Kz valor={getValue() as number} forte />,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      accessorKey: "criadoEm",
      header: "Data",
      cell: ({ row }) => (
        <div className="whitespace-nowrap" title={formatDatetime(row.original.criadoEm)} style={{ fontVariantNumeric: "tabular-nums" }}>
          <p>{formatDate(row.original.criadoEm, "dd/MM/yy HH:mm")}</p>
          {row.original.pagoEm && (
            <p className="text-xs" style={{ color: "var(--text-3)" }}>Pago {formatDate(row.original.pagoEm, "dd/MM HH:mm")}</p>
          )}
        </div>
      ),
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {p.comprovativoUrl && (
              <LinkDocumento href={p.comprovativoUrl} label={`Ver comprovativo do pagamento #${p.id}`} icon={<FileText size={15} />} />
            )}
            {p.faturaUrl && (
              <LinkDocumento href={p.faturaUrl} label={`Ver fatura do pagamento #${p.id}`} icon={<Receipt size={15} />} />
            )}
            {p.podeValidar && (
              <>
                <GlobalButton size="sm" variant="secondary" onClick={() => { setErroAcao(null); setValidarAlvo(p); }}>
                  Validar
                </GlobalButton>
                <GlobalButton size="sm" variant="ghost" onClick={() => { setErroAcao(null); setRejeitarAlvo(p); }}>
                  Rejeitar
                </GlobalButton>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const recebido = r ? kzCompacto(r.recebido.valor) : null;
  const pendente = r ? kzCompacto(r.pendente.valor) : null;
  const taxas = r ? kzCompacto(r.taxasCliente) : null;
  const periodo = filtro.de || filtro.ate
    ? `${filtro.de ? filtro.de.split("-").reverse().join("/") : "início"} – ${filtro.ate ? filtro.ate.split("-").reverse().join("/") : "hoje"}`
    : "Todo o período";

  return (
    <PageShell
      title="Pagamentos"
      subtitle={pagina ? `${pagina.totalItems} ${pagina.totalItems === 1 ? "pagamento" : "pagamentos"} · ${periodo}` : periodo}
    >
      {/* KPIs do período */}
      {r ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label={`Recebido · ${r.recebido.quantidade}`} value={recebido!.valor} suffix={recebido!.sufixo} icon={<Wallet size={16} />} />
          <KPICard label="Transferências por validar" value={r.porValidar.quantidade} suffix={r.porValidar.quantidade ? formatCurrencyAOA(r.porValidar.valor) : undefined} icon={<Hourglass size={16} />} />
          <KPICard label={`Pendente · ${r.pendente.quantidade}`} value={pendente!.valor} suffix={pendente!.sufixo} icon={<Clock size={16} />} />
          <KPICard label="Taxas de serviço cobradas" value={taxas!.valor} suffix={taxas!.sufixo} icon={<BadgeCheck size={16} />} />
        </div>
      ) : (
        !resumo.success && <ErroCarregamento mensagem={resumo.error} onRetry={recarregar} />
      )}

      <FilterTabs
        tabs={TABS_PAGAMENTOS}
        ativa={tab}
        onChange={(id) => atualizar({ tab: id === "todos" ? undefined : id })}
        contadores={r ? { "por-validar": r.porValidar.quantidade } : undefined}
      />

      {!lista.success ? (
        <ErroCarregamento mensagem={lista.error} onRetry={recarregar} />
      ) : (
        <GlobalTable
          data={pagamentos}
          columns={columns}
          isLoading={isPending}
          emptyMessage={
            <div className="space-y-2">
              <p>{vazio(tab, comFiltros)}</p>
              {comFiltros && (
                <button
                  className="text-sm font-semibold cursor-pointer"
                  style={{ color: "var(--blue-700)" }}
                  onClick={() => { setPesquisa(""); atualizar({ metodo: undefined, de: undefined, ate: undefined, q: undefined }); }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          }
          serverPagination={{
            page: pagina!.pageNumber,
            pageSize: pagina!.pageSize,
            totalItems: pagina!.totalItems,
            totalPages: pagina!.totalPages,
            onPageChange: (p) => atualizar({ pagina: p > 1 ? p : undefined }),
          }}
          toolbar={
            <div className="flex flex-wrap items-center gap-2 w-full">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }} />
                <ToolbarInput
                  type="search"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  placeholder="Nome, email ou nº do pagamento/reserva"
                  aria-label="Pesquisar pagamentos"
                  style={{ width: "100%", paddingLeft: 32 }}
                />
              </div>
              <ToolbarSelect
                aria-label="Método de pagamento"
                value={filtro.metodo ?? ""}
                onChange={(e) => atualizar({ metodo: e.target.value || undefined })}
              >
                <option value="">Todos os métodos</option>
                <option value="MCX">Multicaixa Express</option>
                <option value="REFERENCIA">Referência</option>
                <option value="TRANSFERENCIA">Transferência</option>
              </ToolbarSelect>
              <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
                De
                <ToolbarInput type="date" value={filtro.de ?? ""} max={filtro.ate} onChange={(e) => atualizar({ de: e.target.value || undefined })} />
              </label>
              <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
                Até
                <ToolbarInput type="date" value={filtro.ate ?? ""} min={filtro.de} onChange={(e) => atualizar({ ate: e.target.value || undefined })} />
              </label>
            </div>
          }
        />
      )}

      {/* Validar transferência */}
      <ConfirmModal
        open={!!validarAlvo}
        onOpenChange={(o) => !o && fecharModais()}
        title={validarAlvo ? `Validar a transferência #${validarAlvo.id}?` : ""}
        description={
          validarAlvo
            ? `${formatCurrencyAOA(validarAlvo.valor)} · ${referenteA(validarAlvo).titulo}. O pagamento passa a Pago e a reserva fica paga.` +
              (validarAlvo.cliente ? ` ${validarAlvo.cliente.nome ?? "O cliente"} e o parceiro são notificados.` : "") +
              (erroAcao ? `\n\n${erroAcao}` : "")
            : ""
        }
        onConfirm={confirmarValidacao}
        loading={aGravar}
        confirmLabel="Validar pagamento"
        confirmVariant="primary"
      />

      {/* Rejeitar comprovativo */}
      <GlobalModal
        open={!!rejeitarAlvo}
        onOpenChange={(o) => !o && fecharModais()}
        title={rejeitarAlvo ? `Rejeitar o comprovativo #${rejeitarAlvo.id}?` : ""}
        description={
          rejeitarAlvo
            ? `${formatCurrencyAOA(rejeitarAlvo.valor)} · ${referenteA(rejeitarAlvo).titulo}. A comissão associada é cancelada e o cliente pode enviar um novo comprovativo.`
            : ""
        }
        size="md"
        footer={
          <>
            <GlobalButton variant="secondary" onClick={fecharModais} disabled={aGravar}>Voltar</GlobalButton>
            <GlobalButton variant="danger" onClick={confirmarRejeicao} loading={aGravar}>Rejeitar comprovativo</GlobalButton>
          </>
        }
      >
        <CampoMotivo
          id="motivo-rejeicao"
          valor={motivo}
          onChange={(v) => { setMotivo(v); if (erroAcao) setErroAcao(null); }}
          erro={erroAcao}
          ajuda="O cliente recebe este texto por notificação e email."
          placeholder="Ex.: o valor do comprovativo não coincide com o total da reserva."
        />
      </GlobalModal>
    </PageShell>
  );
}
