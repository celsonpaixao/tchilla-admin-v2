"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ReservaAdminDetalhe } from "@/types/admin.types";
import { RESERVA_STATUS_CODE } from "@/types/reserva.types";
import { atualizarStatusReserva } from "@/actions/reserva.actions";
import { PageShell } from "@/components/global/PageShell";
import { StatusBadge } from "@/components/global/StatusBadge";
import { GlobalButton } from "@/components/global/GlobalButton";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { Kz } from "@/components/pagamentos/FinanceiroUI";
import {
  Campo, Cartao, DataCurta, Etiqueta, LinkInterno, Migalhas, Mono, NOMES_ALVO, Nota, nomeParceiroResumo,
} from "@/components/admin/AdminUI";
import { formatCurrencyAOA, formatDatetime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

type Acao = { status: number; titulo: string; rotulo: string; consequencia: string; perigo?: boolean };

const METODOS: Record<string, string> = { MCX: "Multicaixa Express", REFERENCIA: "Referência", TRANSFERENCIA: "Transferência" };

export function ReservaDetalhePage({ reserva, voltar }: { reserva: ReservaAdminDetalhe; voltar: string }) {
  const router = useRouter();
  const [acao, setAcao] = useState<Acao | null>(null);
  const [aGravar, startGravar] = useTransition();
  const r = reserva;
  const cliente = r.cliente?.nome?.trim() || (r.cliente ? `Cliente #${r.cliente.id}` : "o cliente");

  const acoes: Acao[] =
    r.estado === "Pendente"
      ? [
          { status: RESERVA_STATUS_CODE.Cancelado, titulo: `Cancelar a reserva #${r.id}?`, rotulo: "Cancelar reserva", consequencia: `${cliente} deixa de ter esta reserva. Esta ação não se desfaz aqui.`, perigo: true },
          { status: RESERVA_STATUS_CODE.Confirmado, titulo: `Aceitar a reserva #${r.id}?`, rotulo: "Aceitar reserva", consequencia: `A reserva passa a Confirmada para ${cliente}.` },
        ]
      : r.estado === "Confirmado"
        ? [{ status: RESERVA_STATUS_CODE.Concluido, titulo: `Concluir a reserva #${r.id}?`, rotulo: "Marcar como concluída", consequencia: `O evento de ${cliente} fica registado como realizado.` }]
        : [];

  function confirmar() {
    if (!acao) return;
    const alvo = acao;
    startGravar(async () => {
      const res = await atualizarStatusReserva({ id: r.id, status: alvo.status });
      if (!res.success) {
        toast.error("Não foi possível mudar o estado", { description: res.error });
        return;
      }
      setAcao(null);
      toast.success(`Reserva #${r.id} atualizada`);
      router.refresh();
    });
  }

  const totalServicos = r.servicos.reduce((s, x) => s + (x.precoTotal ?? 0), 0);

  return (
    <PageShell
      title={`Reserva #${r.id}`}
      subtitle={[r.tipoEvento, NOMES_ALVO[r.tipo]].filter(Boolean).join(" · ")}
      actions={acoes.map((a) => (
        <GlobalButton key={a.status} variant={a.perigo ? "secondary" : "primary"} onClick={() => setAcao(a)}>
          {a.rotulo}
        </GlobalButton>
      ))}
    >
      <Migalhas itens={[{ label: voltar === ROUTES.RESERVAS.HISTORICO ? "Histórico" : "Reservas", href: voltar }, { label: `#${r.id}` }]} />

      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={r.estado} />
        {r.pago ? <Etiqueta tom="sucesso">Paga</Etiqueta> : <Etiqueta tom="aviso">Por pagar</Etiqueta>}
        <span className="text-xs" style={{ color: "var(--text-3)" }}>
          Criada em {formatDatetime(r.criadoEm)}{r.atualizadoEm ? ` · atualizada em ${formatDatetime(r.atualizadoEm)}` : ""}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Cartao titulo="Evento">
            <dl>
              <Campo rotulo="Início"><DataCurta valor={r.dataInicio} comHora /></Campo>
              <Campo rotulo="Fim"><DataCurta valor={r.dataFim} comHora /></Campo>
              <Campo rotulo="Tipo de evento">{r.tipoEvento || "—"}</Campo>
              <Campo rotulo="Morada">
                {r.morada
                  ? [r.morada.rua, r.morada.numero, r.morada.bairro, r.morada.cidade, r.morada.provincia].filter((x) => x?.trim()).join(", ") || r.morada.nome || "—"
                  : "Sem morada (usa a do espaço)"}
              </Campo>
            </dl>
          </Cartao>

          <Cartao titulo="O que foi reservado">
            <ul className="space-y-3 text-sm">
              {r.espaco && (
                <li className="flex justify-between gap-3">
                  <span>
                    <span className="font-medium" style={{ color: "var(--text)" }}>{r.espaco.nome?.trim() || `Espaço #${r.espaco.id}`}</span>
                    <span className="block text-xs" style={{ color: "var(--text-3)" }}>Espaço</span>
                  </span>
                </li>
              )}
              {r.servicos.map((s) => (
                <li key={`s${s.servicoId}`} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <span className="font-medium" style={{ color: "var(--text)" }}>{s.nome || `Serviço #${s.servicoId}`}</span>
                    <span className="block text-xs" style={{ color: "var(--text-3)" }}>
                      Serviço{s.pacote ? ` · pacote ${s.pacote}` : ""}{s.quantidade ? ` · ${s.quantidade} × ${formatCurrencyAOA(s.precoUnitario ?? 0)}` : ""}
                    </span>
                    {s.extras.map((e, i) => (
                      <span key={i} className="block text-xs" style={{ color: "var(--text-3)" }}>
                        + {e.nome} · {e.quantidade} × {formatCurrencyAOA(e.precoUnitario)}
                      </span>
                    ))}
                  </span>
                  {s.precoTotal != null && <span className="flex-shrink-0"><Kz valor={s.precoTotal} /></span>}
                </li>
              ))}
              {r.combos.map((c) => (
                <li key={`c${c.comboId}`} className="flex justify-between gap-3">
                  <span>
                    <span className="font-medium" style={{ color: "var(--text)" }}>{c.nome || `Combo #${c.comboId}`}</span>
                    <span className="block text-xs" style={{ color: "var(--text-3)" }}>Combo</span>
                  </span>
                  <span className="flex-shrink-0"><Kz valor={c.preco} /></span>
                </li>
              ))}
              {r.itensAdicionais.map((i, n) => (
                <li key={`i${n}`} className="flex justify-between gap-3">
                  <span>
                    <span style={{ color: "var(--text)" }}>{i.nome}</span>
                    <span className="block text-xs" style={{ color: "var(--text-3)" }}>Item adicional · {i.quantidade} × {formatCurrencyAOA(i.precoUnitario)}</span>
                  </span>
                  <span className="flex-shrink-0"><Kz valor={i.quantidade * i.precoUnitario} /></span>
                </li>
              ))}
              {!r.espaco && r.servicos.length === 0 && r.combos.length === 0 && (
                <li style={{ color: "var(--text-3)" }}>Os itens desta reserva já não existem (foram removidos pelo parceiro).</li>
              )}
            </ul>
            <div className="flex justify-between pt-3 text-sm font-semibold" style={{ borderTop: "1px solid var(--border)" }}>
              <span>Total da reserva</span>
              <Kz valor={r.valorTotal} forte />
            </div>
            {r.servicos.length > 1 && totalServicos > 0 && (
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Os serviços somam {formatCurrencyAOA(totalServicos)}.</p>
            )}
          </Cartao>

          <Cartao titulo={`Pagamentos · ${r.pagamentos.length}`}>
            {r.pagamentos.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-3)" }}>Ainda não há pagamentos para esta reserva.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {r.pagamentos.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <LinkInterno href={`${ROUTES.FINANCEIRO.PAGAMENTOS}?q=${p.id}`}><Mono>#{p.id}</Mono></LinkInterno>{" "}
                      <span style={{ color: "var(--text-2)" }}>{METODOS[p.metodoPagamento ?? ""] ?? p.metodoPagamento ?? "—"}</span>
                      <span className="block text-xs" style={{ color: "var(--text-3)" }}>
                        {formatDatetime(p.criadoEm)}{p.pagoEm ? ` · pago ${formatDatetime(p.pagoEm)}` : ""}{p.split ? " · com split" : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-3 flex-shrink-0">
                      <Kz valor={p.valor} />
                      <StatusBadge status={p.estado} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {r.comissoes.length > 0 && (
              <div className="pt-3 space-y-1" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--text-3)" }}>Comissões da transferência</p>
                {r.comissoes.map((c) => (
                  <p key={c.id} className="flex justify-between text-sm">
                    <span>#{c.id} · {c.percentual}% · <StatusBadge status={c.estado} /></span>
                    <Kz valor={c.valor} />
                  </p>
                ))}
              </div>
            )}
          </Cartao>
        </div>

        <div className="space-y-4">
          <Cartao titulo="Cliente">
            {r.cliente ? (
              <dl>
                <Campo rotulo="Nome"><LinkInterno href={ROUTES.USUARIOS.DETALHE(r.cliente.id)}>{cliente}</LinkInterno></Campo>
                {r.cliente.email && <Campo rotulo="Email"><a href={`mailto:${r.cliente.email}`} style={{ color: "var(--blue-700)" }}>{r.cliente.email}</a></Campo>}
                {r.cliente.telefone && <Campo rotulo="Telefone"><a href={`tel:${r.cliente.telefone}`} style={{ color: "var(--blue-700)" }}>{r.cliente.telefone}</a></Campo>}
              </dl>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-3)" }}>A conta do cliente já não existe.</p>
            )}
          </Cartao>

          <Cartao titulo={`Parceiros · ${r.parceiros.length}`}>
            {r.parceiros.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-3)" }}>Sem parceiro associado.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {r.parceiros.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <span className="font-medium" style={{ color: "var(--text)" }}>{nomeParceiroResumo(p)}</span>
                    <LinkInterno href={`${ROUTES.RESERVAS.LISTAGEM}?agencia=${p.id}`} titulo="Ver as reservas deste parceiro">Reservas</LinkInterno>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>

          <Cartao titulo={`Avaliações · ${r.avaliacoes.length}`}>
            {r.avaliacoes.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-3)" }}>O cliente ainda não avaliou esta reserva.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {r.avaliacoes.map((a) => (
                  <li key={a.id}>
                    <span className="flex items-center gap-2"><Nota valor={a.nota} />{a.apagada && <Etiqueta>Apagada pelo cliente</Etiqueta>}</span>
                    {a.mensagem && <span className="block" style={{ color: "var(--text-2)" }}>{a.mensagem}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Cartao>
        </div>
      </div>

      <ConfirmModal
        open={!!acao}
        onOpenChange={(o) => !o && setAcao(null)}
        title={acao?.titulo ?? ""}
        description={acao ? `${acao.consequencia} Valor: ${formatCurrencyAOA(r.valorTotal)}.` : ""}
        onConfirm={confirmar}
        loading={aGravar}
        confirmLabel={acao?.perigo ? "Sim, cancelar" : acao?.rotulo ?? "Confirmar"}
        confirmVariant={acao?.perigo ? "danger" : "primary"}
      />
    </PageShell>
  );
}
