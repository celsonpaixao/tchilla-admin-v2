"use client";
import { CalendarCheck, Heart, MailOpen, Star, Ticket, Wallet } from "lucide-react";
import type { AtividadeUsuarioAdmin } from "@/types/admin.types";
import { PageShell } from "@/components/global/PageShell";
import { KPICard } from "@/components/global/KPICard";
import { StatusBadge } from "@/components/global/StatusBadge";
import { GlobalAvatar } from "@/components/global/GlobalAvatar";
import { Kz, kzCompacto } from "@/components/pagamentos/FinanceiroUI";
import { Campo, Cartao, DataCurta, Etiqueta, LinkInterno, Migalhas, Mono, NOMES_ALVO, Nota } from "@/components/admin/AdminUI";
import { formatDatetime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const NOME_TIPO: Record<string, string> = { cliente: "Cliente", parceiro: "Parceiro", equipa: "Equipa" };

export function UsuarioDetalhePage({ atividade }: { atividade: AtividadeUsuarioAdmin }) {
  const a = atividade;
  const u = a.usuario;
  const nome = u.nome?.trim() || `Utilizador #${u.id}`;
  const pago = kzCompacto(a.reservasPagas.valor);

  return (
    <PageShell title={nome} subtitle={`${NOME_TIPO[u.tipo]} · registado em ${formatDatetime(u.criadoEm)}`}>
      <Migalhas itens={[{ label: "Clientes", href: ROUTES.USUARIOS.CLIENTES }, { label: nome }]} />

      <div className="flex items-center gap-3 flex-wrap">
        <GlobalAvatar src={u.foto} name={nome} size="lg" />
        <div className="flex items-center gap-2 flex-wrap">
          <Etiqueta tom={u.tipo === "equipa" ? "info" : "neutro"}>{NOME_TIPO[u.tipo]}</Etiqueta>
          {u.apagado ? <Etiqueta tom="perigo">Conta apagada</Etiqueta> : u.verificado ? <Etiqueta tom="sucesso">Verificada</Etiqueta> : <Etiqueta tom="aviso">Por verificar</Etiqueta>}
          {u.google && <Etiqueta>Entra com Google</Etiqueta>}
          {u.agenciaId && (
            <LinkInterno href={`${ROUTES.USUARIOS.PARCEIROS}?tab=todos&q=${encodeURIComponent(u.email ?? nome)}`}>Ver perfil de parceiro</LinkInterno>
          )}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <KPICard label={`Reservas · ${a.reservasPagas.quantidade} pagas`} value={a.reservasTotal.quantidade} icon={<CalendarCheck size={16} />} />
        <KPICard label="Valor pago em reservas" value={pago.valor} suffix={pago.sufixo} icon={<Wallet size={16} />} />
        <KPICard label="Avaliações feitas" value={a.avaliacoes} icon={<Star size={16} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Cartao
            titulo="Últimas reservas"
            acao={a.reservasTotal.quantidade > a.ultimasReservas.length && (
              <LinkInterno href={`${ROUTES.RESERVAS.LISTAGEM}?cliente=${u.id}`}>Ver todas ({a.reservasTotal.quantidade})</LinkInterno>
            )}
          >
            {a.ultimasReservas.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-3)" }}>Ainda não fez reservas.</p>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                {a.ultimasReservas.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0">
                      <LinkInterno href={ROUTES.RESERVAS.DETALHE(r.id)}><Mono>#{r.id}</Mono></LinkInterno>{" "}
                      <span style={{ color: "var(--text)" }}>{r.espaco?.nome?.trim() || NOMES_ALVO[r.tipo] || "Reserva"}</span>
                      <span className="block text-xs" style={{ color: "var(--text-3)" }}>
                        Evento <DataCurta valor={r.dataInicio} />{r.tipoEvento ? ` · ${r.tipoEvento}` : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-3 flex-shrink-0">
                      <Kz valor={r.valorTotal} />
                      <StatusBadge status={r.estado} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>

          <Cartao titulo="Últimos pagamentos">
            {a.ultimosPagamentos.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-3)" }}>Ainda não há pagamentos.</p>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                {a.ultimosPagamentos.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span>
                      <LinkInterno href={`${ROUTES.FINANCEIRO.PAGAMENTOS}?q=${p.id}`}><Mono>#{p.id}</Mono></LinkInterno>{" "}
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>{formatDatetime(p.criadoEm)}</span>
                    </span>
                    <span className="flex items-center gap-3 flex-shrink-0">
                      <Kz valor={p.valor} />
                      <StatusBadge status={p.estado} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>

          <Cartao
            titulo="Últimas avaliações"
            acao={a.avaliacoes > 0 && <LinkInterno href={`${ROUTES.GESTAO.AVALIACOES}?usuario=${u.id}&apagadas=1`}>Ver todas</LinkInterno>}
          >
            {a.ultimasAvaliacoes.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-3)" }}>Ainda não avaliou nada.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {a.ultimasAvaliacoes.map((v) => (
                  <li key={v.id}>
                    <span className="flex items-center gap-2 flex-wrap">
                      <Nota valor={v.nota} />
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>
                        {v.alvo ? `${NOMES_ALVO[v.alvo]} #${v.alvoId}` : "—"} · <DataCurta valor={v.criadoEm} />
                      </span>
                      {v.apagada && <Etiqueta>Apagada pelo cliente</Etiqueta>}
                    </span>
                    {v.mensagem && <span className="block" style={{ color: "var(--text-2)" }}>{v.mensagem}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Cartao>
        </div>

        <div className="space-y-4">
          <Cartao titulo="Contacto">
            <dl>
              <Campo rotulo="Email">{u.email ? <a href={`mailto:${u.email}`} style={{ color: "var(--blue-700)" }}>{u.email}</a> : "—"}</Campo>
              <Campo rotulo="Telefone">{u.telefone ? <a href={`tel:${u.telefone}`} style={{ color: "var(--blue-700)" }}>{u.telefone}</a> : "—"}</Campo>
              <Campo rotulo="Nº de conta"><Mono>#{u.id}</Mono></Campo>
              <Campo rotulo="Última reserva"><DataCurta valor={a.ultimaReservaEm} comHora /></Campo>
            </dl>
          </Cartao>

          <Cartao titulo="Outra atividade">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between"><span className="flex items-center gap-2"><Heart size={14} aria-hidden /> Favoritos</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{a.favoritos}</span></li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Ticket size={14} aria-hidden /> Compras de bilhetes</span>
                {a.comprasBilhetes > 0
                  ? <LinkInterno href={`${ROUTES.GESTAO.CATALOGO}?tab=bilhetes&cliente=${u.id}`}>{a.comprasBilhetes}</LinkInterno>
                  : <span>0</span>}
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2"><MailOpen size={14} aria-hidden /> Convites digitais</span>
                {a.convites > 0
                  ? <LinkInterno href={`${ROUTES.GESTAO.CONVITES}?q=${encodeURIComponent(u.email ?? nome)}`}>{a.convites}</LinkInterno>
                  : <span>0</span>}
              </li>
            </ul>
          </Cartao>
        </div>
      </div>
    </PageShell>
  );
}
