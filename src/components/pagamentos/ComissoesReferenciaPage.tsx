"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Clock, Gift, Wallet } from "lucide-react";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type {
  CodigoReferenciaInterface,
  ComissoesDoMes,
  LinhaComissaoReferencia,
  TipoComissaoReferencia,
} from "@/types/comissaoReferencia.types";
import { marcarComissoesPagas } from "@/actions/comissaoReferencia.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { StatusBadge } from "@/components/global/StatusBadge";
import { GlobalModal } from "@/components/global/GlobalModal";
import { GlobalButton } from "@/components/global/GlobalButton";
import { GlobalInput } from "@/components/global/GlobalInput";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { ErroCarregamento, ToolbarSelect } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { formatCurrencyAOA, formatDate } from "@/lib/utils";
import { Kz, kzCompacto } from "./FinanceiroUI";

interface ComissoesReferenciaPageProps {
  papel: string | null;
  codigos: ActionResult<CodigoReferenciaInterface[]>;
  codigoId: number | null;
  /** AAAA-MM */
  mes: string;
  comissoes: ActionResult<ComissoesDoMes> | null;
}

const TIPOS: Record<TipoComissaoReferencia, string> = {
  comissao: "Comissão",
  estorno: "Estorno",
  bonus: "Bónus",
};

function deslocarMes(mes: string, delta: number) {
  const [ano, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(ano, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function nomeDoMes(mes: string) {
  const texto = format(parse(`${mes}-01`, "yyyy-MM-dd", new Date()), "MMMM 'de' yyyy", { locale: ptBR });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function hojeIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ComissoesReferenciaPage({ papel, codigos, codigoId, mes, comissoes }: ComissoesReferenciaPageProps) {
  const { atualizar, recarregar, isPending } = useFiltrosUrl();
  const eAdmin = papel === "Admin";
  const dados = comissoes?.success ? comissoes.data : null;
  const [linhas, setLinhas] = useState<LinhaComissaoReferencia[]>(dados?.linhas ?? []);
  const [escolhidas, setEscolhidas] = useState<Set<number>>(new Set());
  const [aPagar, setAPagar] = useState(false);
  const [referencia, setReferencia] = useState("");
  const [dataPagamento, setDataPagamento] = useState(hojeIso());
  const [erroReferencia, setErroReferencia] = useState<string>();
  const [aGravar, startGravar] = useTransition();

  useEffect(() => {
    setLinhas(comissoes?.success ? comissoes.data.linhas : []);
    setEscolhidas(new Set());
  }, [comissoes]);

  const porPagar = useMemo(() => linhas.filter((l) => l.estado === "por_pagar"), [linhas]);
  const totalEscolhido = useMemo(
    () => linhas.filter((l) => escolhidas.has(l.id)).reduce((s, l) => s + l.valor, 0),
    [linhas, escolhidas],
  );

  function alternar(id: number) {
    setEscolhidas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function abrirPagamento() {
    setReferencia("");
    setErroReferencia(undefined);
    setDataPagamento(hojeIso());
    setAPagar(true);
  }

  function pagar() {
    const ref = referencia.trim();
    if (!ref) {
      setErroReferencia("Indica a referência da transferência.");
      return;
    }
    const ids = [...escolhidas];
    startGravar(async () => {
      const res = await marcarComissoesPagas(ids, ref, dataPagamento);
      if (!res.success) {
        toast.error("Não foi possível marcar como pago", { description: res.error });
        return;
      }
      setLinhas((prev) =>
        prev.map((l) => (escolhidas.has(l.id) ? { ...l, estado: "pago", referenciaPagamento: ref, pagoEm: dataPagamento } : l)),
      );
      setEscolhidas(new Set());
      setAPagar(false);
      toast.success(res.data === 1 ? "1 linha marcada como paga" : `${res.data} linhas marcadas como pagas`, {
        description: `${formatCurrencyAOA(totalEscolhido)} · referência ${ref}`,
      });
      recarregar();
    });
  }

  const columns: ColumnDef<LinhaComissaoReferencia, unknown>[] = [
    ...(eAdmin
      ? [
          {
            id: "escolher",
            header: () => (
              <input
                type="checkbox"
                aria-label="Escolher todas as linhas por pagar"
                checked={porPagar.length > 0 && porPagar.every((l) => escolhidas.has(l.id))}
                disabled={porPagar.length === 0}
                onChange={(e) => setEscolhidas(e.target.checked ? new Set(porPagar.map((l) => l.id)) : new Set())}
                className="cursor-pointer"
              />
            ),
            cell: ({ row }: { row: { original: LinhaComissaoReferencia } }) =>
              row.original.estado === "por_pagar" ? (
                <input
                  type="checkbox"
                  aria-label={`Escolher a linha ${row.original.id}`}
                  checked={escolhidas.has(row.original.id)}
                  onChange={() => alternar(row.original.id)}
                  className="cursor-pointer"
                />
              ) : null,
          } as ColumnDef<LinhaComissaoReferencia, unknown>,
        ]
      : []),
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <div>
          <p className="font-medium" style={{ color: row.original.tipo === "estorno" ? "var(--red, #c0392b)" : "var(--text)" }}>
            {TIPOS[row.original.tipo]}
          </p>
          {row.original.nota && (
            <p className="text-xs" style={{ color: "var(--text-3)" }}>{row.original.nota}</p>
          )}
        </div>
      ),
    },
    {
      id: "reserva",
      header: "Reserva",
      cell: ({ row }) => {
        const l = row.original;
        return (
          <div>
            {l.reservaId && <p>Reserva #{l.reservaId}</p>}
            {l.pedidoId && (
              <p className={l.reservaId ? "text-xs" : undefined} style={{ color: l.reservaId ? "var(--text-3)" : undefined }}>
                Pedido #{l.pedidoId}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "anuncio",
      header: "Anúncio",
      cell: ({ getValue }) => <span>{(getValue() as string | null) ?? "—"}</span>,
    },
    {
      accessorKey: "base",
      header: () => <span className="block w-full text-right">Base</span>,
      cell: ({ row }) =>
        row.original.base == null ? (
          <span className="block text-right" style={{ color: "var(--text-3)" }}>—</span>
        ) : (
          <div>
            <Kz valor={row.original.base} />
            {row.original.percentual != null && (
              <p className="text-xs text-right" style={{ color: "var(--text-3)" }}>{row.original.percentual}%</p>
            )}
          </div>
        ),
    },
    {
      accessorKey: "valor",
      header: () => <span className="block w-full text-right">Valor</span>,
      cell: ({ getValue }) => <Kz valor={getValue() as number} forte />,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <div>
          <StatusBadge status={row.original.estado === "pago" ? "Pago" : "Pendente"} />
          {row.original.estado === "pago" && (
            <p className="text-xs mt-1 whitespace-nowrap" style={{ color: "var(--text-3)" }}>
              {row.original.pagoEm ? formatDate(row.original.pagoEm) : ""}
              {row.original.referenciaPagamento ? ` · ${row.original.referenciaPagamento}` : ""}
            </p>
          )}
        </div>
      ),
    },
  ];

  const lista = codigos.success ? codigos.data : [];
  const codigo = lista.find((c) => c.cupomId === codigoId) ?? null;

  if (!codigos.success) {
    return (
      <PageShell title="Códigos de referência" subtitle="Comissões de quem divulga uma coleção.">
        <ErroCarregamento mensagem={eAdmin ? codigos.error : "Só a equipa com papel Admin vê e paga estas comissões."} onRetry={recarregar} />
      </PageShell>
    );
  }

  if (!codigo) {
    return (
      <PageShell title="Códigos de referência" subtitle="Comissões de quem divulga uma coleção.">
        <div className="rounded-xl p-6 text-sm" style={{ background: "var(--surface, #fff)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
          <p className="font-medium mb-1" style={{ color: "var(--text)" }}>Ainda não há códigos de referência.</p>
          <p>
            Um código de referência é um cupão a 0% ligado a uma coleção, com a percentagem de quem o divulga
            (por exemplo, 3% para o casal do &quot;Casamento E&amp;C&quot;). Quem abre o link da coleção com o código
            fica com ele nas reservas, e as comissões aparecem aqui ao mês.
          </p>
        </div>
      </PageShell>
    );
  }

  const r = dados;
  const kpiPorPagar = r ? kzCompacto(r.porPagar) : null;
  const kpiPago = r ? kzCompacto(r.pago) : null;
  const kpiAcumulado = r ? kzCompacto(r.porPagarAcumulado) : null;
  const janela =
    codigo.desde || codigo.ate
      ? `${codigo.desde ? formatDate(codigo.desde) : "…"} a ${codigo.ate ? formatDate(codigo.ate) : "…"}`
      : "sem prazo";

  return (
    <PageShell
      title="Códigos de referência"
      subtitle={`${codigo.codigo}${codigo.beneficiario ? ` · ${codigo.beneficiario}` : ""} · ${codigo.percentual}% dos anúncios de "${codigo.colecao ?? `coleção #${codigo.colecaoId}`}" · ${janela}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {lista.length > 1 && (
            <ToolbarSelect
              aria-label="Código de referência"
              value={codigo.cupomId}
              onChange={(e) => atualizar({ codigo: e.target.value })}
            >
              {lista.map((c) => (
                <option key={c.cupomId} value={c.cupomId}>
                  {c.codigo}
                  {c.beneficiario ? ` · ${c.beneficiario}` : ""}
                </option>
              ))}
            </ToolbarSelect>
          )}
          <div className="flex items-center gap-1">
            <GlobalButton size="sm" variant="secondary" aria-label="Mês anterior" onClick={() => atualizar({ mes: deslocarMes(mes, -1) })}>
              <ChevronLeft size={16} />
            </GlobalButton>
            <span className="text-sm font-medium px-2 whitespace-nowrap" style={{ color: "var(--text)", minWidth: 140, textAlign: "center" }}>
              {nomeDoMes(mes)}
            </span>
            <GlobalButton size="sm" variant="secondary" aria-label="Mês seguinte" onClick={() => atualizar({ mes: deslocarMes(mes, 1) })}>
              <ChevronRight size={16} />
            </GlobalButton>
          </div>
        </div>
      }
    >
      {r && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <KPICard label="Por pagar neste mês" value={kpiPorPagar!.valor} suffix={kpiPorPagar!.sufixo} icon={<Clock size={16} />} />
          <KPICard label="Pago neste mês" value={kpiPago!.valor} suffix={kpiPago!.sufixo} icon={<Wallet size={16} />} />
          <KPICard
            label="Por pagar até este mês"
            value={kpiAcumulado!.valor}
            suffix={kpiAcumulado!.sufixo}
            icon={<Gift size={16} />}
            accent={r.porPagarAcumulado > 0}
          />
        </div>
      )}

      {comissoes && !comissoes.success ? (
        <ErroCarregamento mensagem={comissoes.error} onRetry={recarregar} />
      ) : (
        <GlobalTable
          data={linhas}
          columns={columns}
          isLoading={isPending}
          emptyMessage={`Sem comissões em ${nomeDoMes(mes).toLowerCase()}. Contam os anúncios da coleção reservados com o código ${codigo.codigo} e pagos neste mês.`}
          searchPlaceholder="Pesquisar anúncio…"
          toolbar={
            <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
              <p className="text-xs" style={{ color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
                {linhas.length} {linhas.length === 1 ? "linha" : "linhas"}
                {escolhidas.size > 0 && ` · ${escolhidas.size} escolhidas · ${formatCurrencyAOA(totalEscolhido)}`}
              </p>
              {eAdmin && (
                <GlobalButton size="sm" disabled={escolhidas.size === 0} onClick={abrirPagamento}>
                  Marcar como pago
                </GlobalButton>
              )}
            </div>
          }
        />
      )}

      <GlobalModal
        open={aPagar}
        onOpenChange={(o) => !aGravar && setAPagar(o)}
        title="Marcar como pago"
        description={`${escolhidas.size} ${escolhidas.size === 1 ? "linha" : "linhas"} · ${formatCurrencyAOA(totalEscolhido)} para ${codigo.beneficiario ?? codigo.codigo}. Marca só depois de fazer a transferência.`}
        size="sm"
        footer={
          <>
            <GlobalButton variant="secondary" onClick={() => setAPagar(false)} disabled={aGravar}>
              Cancelar
            </GlobalButton>
            <GlobalButton onClick={pagar} loading={aGravar}>
              Marcar como pago
            </GlobalButton>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <GlobalInput
            label="Referência da transferência"
            required
            value={referencia}
            maxLength={120}
            onChange={(e) => {
              setReferencia(e.target.value);
              setErroReferencia(undefined);
            }}
            error={erroReferencia}
            placeholder="Ex.: TRF-2026-12-001"
            autoFocus
          />
          <GlobalInput
            label="Data do pagamento"
            type="date"
            value={dataPagamento}
            max={hojeIso()}
            onChange={(e) => setDataPagamento(e.target.value)}
          />
        </div>
      </GlobalModal>
    </PageShell>
  );
}
