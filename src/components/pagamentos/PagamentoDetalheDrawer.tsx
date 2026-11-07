"use client";
import { useEffect, useState } from "react";
import type { ActionResult } from "@/types/common.types";
import { METODO_LABELS, type PagamentoInterface } from "@/types/payment.types";
import { fetchPagamentoDetalhe, type PagamentoDetalhe } from "@/actions/admin.actions";
import { GlobalDrawer } from "@/components/global/GlobalDrawer";
import { StatusBadge } from "@/components/global/StatusBadge";
import { ErroCarregamento } from "@/components/global/FiltrosUI";
import { Campo, LinkInterno, Mono } from "@/components/admin/AdminUI";
import { formatCurrencyAOA, formatDatetime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

/** Um pagamento com os identificadores do fornecedor, a reserva e as comissões. */
export function PagamentoDetalheDrawer({ pagamento, onClose }: { pagamento: PagamentoInterface | null; onClose: () => void }) {
  const [res, setRes] = useState<ActionResult<PagamentoDetalhe> | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const id = pagamento?.id;

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    setRes(null);
    fetchPagamentoDetalhe(id).then((r) => ativo && setRes(r));
    return () => { ativo = false; };
  }, [id, tentativa]);

  const d = res?.success ? res.data : null;
  const p = d?.pagamento ?? pagamento;

  return (
    <GlobalDrawer
      open={!!pagamento}
      onOpenChange={(o) => !o && onClose()}
      title={p ? `Pagamento #${p.id}` : undefined}
      description={p ? `${formatCurrencyAOA(p.valor)} · ${METODO_LABELS[p.metodoPagamento ?? ""] ?? p.metodoPagamento ?? "—"}` : undefined}
      width="md"
    >
      {p && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={p.estado} />
            {p.split && <span className="text-xs" style={{ color: "var(--text-3)" }}>Com split para o parceiro</span>}
          </div>

          <dl>
            <Campo rotulo="Criado">{formatDatetime(p.criadoEm)}</Campo>
            {p.pagoEm && <Campo rotulo="Pago">{formatDatetime(p.pagoEm)}</Campo>}
            <Campo rotulo="Cliente">
              {p.cliente ? <LinkInterno href={ROUTES.USUARIOS.DETALHE(p.cliente.id)}>{p.cliente.nome ?? `#${p.cliente.id}`}</LinkInterno> : "—"}
            </Campo>
            <Campo rotulo="Valor pago">{formatCurrencyAOA(p.valor)}</Campo>
            {p.taxaCliente != null && <Campo rotulo="Taxa do cliente">{formatCurrencyAOA(p.taxaCliente)}</Campo>}
            {p.comissaoPlataforma != null && <Campo rotulo="Comissão Tchilla">{formatCurrencyAOA(p.comissaoPlataforma)}</Campo>}
            {p.valorParceiro != null && <Campo rotulo="Para o parceiro">{formatCurrencyAOA(p.valorParceiro)}</Campo>}
            {p.referencia && <Campo rotulo="Referência"><Mono>{p.entidade ? `${p.entidade} · ` : ""}{p.referencia}</Mono></Campo>}
            {p.fornecedor && <Campo rotulo="Fornecedor">{p.fornecedor}</Campo>}
          </dl>

          {!res ? (
            <div className="space-y-2" aria-label="A carregar o detalhe"><div className="skeleton h-4 w-2/3" /><div className="skeleton h-4 w-1/2" /></div>
          ) : !res.success ? (
            <ErroCarregamento mensagem={res.error} onRetry={() => setTentativa((t) => t + 1)} />
          ) : d && (
            <>
              {(d.transacaoId || d.operationCode || d.referenciaExterna || d.codigoEkwanza) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>Identificadores do fornecedor</p>
                  <dl>
                    {d.transacaoId && <Campo rotulo="Transação"><Mono>{d.transacaoId}</Mono></Campo>}
                    {d.operationCode && <Campo rotulo="Operação"><Mono>{d.operationCode}</Mono></Campo>}
                    {d.referenciaExterna && <Campo rotulo="Ref. externa"><Mono>{d.referenciaExterna}</Mono></Campo>}
                    {d.codigoEkwanza && <Campo rotulo="Código É-kwanza"><Mono>{d.codigoEkwanza}</Mono></Campo>}
                  </dl>
                </div>
              )}

              {d.reserva && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>Reserva</p>
                  <p className="flex items-center justify-between gap-2 text-sm">
                    <LinkInterno href={ROUTES.RESERVAS.DETALHE(d.reserva.id)}>Reserva #{d.reserva.id}</LinkInterno>
                    <span className="flex items-center gap-2">
                      {formatCurrencyAOA(d.reserva.valorTotal)} <StatusBadge status={d.reserva.estado} />
                    </span>
                  </p>
                  {d.reserva.apagada && <p className="text-xs" style={{ color: "var(--warning-fg)" }}>Esta reserva foi apagada.</p>}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>Comissões · {d.comissoes.length}</p>
                {d.comissoes.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>Sem comissões (só as transferências geram comissão a pagar pelo parceiro).</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {d.comissoes.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-2">
                        <span>#{c.id} · {c.agencia ?? `Parceiro #${c.agenciaId}`} · {c.percentual}%</span>
                        <span className="flex items-center gap-2">{formatCurrencyAOA(c.valor)} <StatusBadge status={c.estado} /></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </GlobalDrawer>
  );
}
