"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarCheck, Heart, MailOpen, Star, Ticket, Wallet } from "lucide-react";
import type { AtividadeUsuarioAdmin, ImpedimentosApagarConta } from "@/types/admin.types";
import { apagarConta, bloquearConta, desbloquearConta } from "@/actions/admin.actions";
import { PageShell } from "@/components/global/PageShell";
import { GlobalButton } from "@/components/global/GlobalButton";
import { ConfirmModal } from "@/components/global/GlobalModal";
import { AcaoComMotivo } from "@/components/admin/AcaoComMotivo";
import { KPICard } from "@/components/global/KPICard";
import { StatusBadge } from "@/components/global/StatusBadge";
import { GlobalAvatar } from "@/components/global/GlobalAvatar";
import { Kz, kzCompacto } from "@/components/pagamentos/FinanceiroUI";
import { Campo, Cartao, DataCurta, Etiqueta, LinkInterno, Migalhas, Mono, NOMES_ALVO, Nota } from "@/components/admin/AdminUI";
import { formatDatetime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const NOME_TIPO: Record<string, string> = { cliente: "Cliente", parceiro: "Parceiro", equipa: "Equipa" };

/** Frase com o que ainda impede apagar a conta, ou null se nada impede. */
function textoImpedimentos(i?: ImpedimentosApagarConta | null): string | null {
  if (!i || i.nenhum) return null;
  const partes: string[] = [];
  const juntar = (n: number, um: string, varios: string) => { if (n > 0) partes.push(n === 1 ? um : `${n} ${varios}`); };
  juntar(i.reservasFuturasComoCliente, "1 reserva por realizar como cliente", "reservas por realizar como cliente");
  juntar(i.reservasFuturasNosAnuncios, "1 reserva por realizar nos anúncios", "reservas por realizar nos anúncios");
  juntar(i.espacosPublicados, "1 espaço publicado", "espaços publicados");
  juntar(i.servicosAtivos, "1 serviço", "serviços");
  juntar(i.combosAtivos, "1 combo ativo", "combos ativos");
  juntar(i.eventosFuturos, "1 evento por realizar", "eventos por realizar");
  return `Ainda não é possível apagar: tem ${partes.join(", ")}. Cancela as reservas e retira os anúncios primeiro.`;
}

interface UsuarioDetalhePageProps {
  atividade: AtividadeUsuarioAdmin;
  /** Papel da sessão: contas da equipa e apagar exigem Admin. */
  papel: string | null;
  /** ID da conta com sessão: ninguém se bloqueia nem se apaga a si próprio. */
  eu: number | null;
}

export function UsuarioDetalhePage({ atividade, papel, eu }: UsuarioDetalhePageProps) {
  const router = useRouter();
  const [bloquear, setBloquear] = useState(false);
  const [desbloquear, setDesbloquear] = useState(false);
  const [apagar, setApagar] = useState(false);
  const [aGravar, startGravar] = useTransition();
  const a = atividade;
  // A resposta da ação atualiza logo o estado; o router.refresh() traz o resto da ficha depois.
  const [m, setM] = useState(a.moderacao);
  useEffect(() => setM(a.moderacao), [a.moderacao]);
  const u = { ...a.usuario, bloqueado: m?.bloqueada ?? a.usuario.bloqueado };
  const nome = u.nome?.trim() || `Utilizador #${u.id}`;
  const pago = kzCompacto(a.reservasPagas.valor);
  const eAdmin = papel === "Admin";
  const propria = eu === u.id;
  const podeModerar = !u.apagado && !propria && u.papel !== "Admin" && (u.tipo !== "equipa" || eAdmin);
  const podeApagar = eAdmin && !u.anonimizado && !propria && u.papel !== "Admin";

  async function confirmarBloqueio(motivo: string) {
    const res = await bloquearConta(u.id, motivo);
    if (!res.success) return res.error;
    setM(res.data);
    setBloquear(false);
    toast.success(`Conta de ${nome} bloqueada`, { description: res.mensagem });
    router.refresh();
    return null;
  }

  function confirmarDesbloqueio() {
    startGravar(async () => {
      const res = await desbloquearConta(u.id);
      if (!res.success) {
        toast.error("Não foi possível desbloquear", { description: res.error });
        return;
      }
      setM(res.data);
      setDesbloquear(false);
      toast.success(`Conta de ${nome} desbloqueada`, { description: res.mensagem });
      router.refresh();
    });
  }

  async function confirmarApagar(motivo: string) {
    const res = await apagarConta(u.id, motivo);
    if (!res.success) return res.error;
    setApagar(false);
    toast.success("Conta apagada e anonimizada", { description: res.mensagem });
    router.refresh();
    return null;
  }

  return (
    <PageShell
      title={nome}
      subtitle={`${NOME_TIPO[u.tipo]} · registado em ${formatDatetime(u.criadoEm)}`}
      actions={
        <>
          {podeModerar && (u.bloqueado
            ? <GlobalButton variant="secondary" onClick={() => setDesbloquear(true)}>Desbloquear conta</GlobalButton>
            : <GlobalButton variant="secondary" onClick={() => setBloquear(true)}>Bloquear conta</GlobalButton>)}
          {podeApagar && <GlobalButton variant="ghost" onClick={() => setApagar(true)} style={{ color: "var(--danger-fg)" }}>Apagar conta</GlobalButton>}
        </>
      }
    >
      <Migalhas itens={[{ label: "Clientes", href: ROUTES.USUARIOS.CLIENTES }, { label: nome }]} />

      <div className="flex items-center gap-3 flex-wrap">
        <GlobalAvatar src={u.foto} name={nome} size="lg" />
        <div className="flex items-center gap-2 flex-wrap">
          <Etiqueta tom={u.tipo === "equipa" ? "info" : "neutro"}>{NOME_TIPO[u.tipo]}</Etiqueta>
          {u.anonimizado ? <Etiqueta tom="perigo">Apagada e anonimizada</Etiqueta> : u.apagado ? <Etiqueta tom="perigo">Conta apagada</Etiqueta> : u.verificado ? <Etiqueta tom="sucesso">Verificada</Etiqueta> : <Etiqueta tom="aviso">Por verificar</Etiqueta>}
          {u.bloqueado && <Etiqueta tom="perigo">Bloqueada</Etiqueta>}
          {u.google && <Etiqueta>Entra com Google</Etiqueta>}
          {u.agenciaId && (
            <LinkInterno href={`${ROUTES.USUARIOS.PARCEIROS}?tab=todos&q=${encodeURIComponent(u.email ?? nome)}`}>Ver perfil de parceiro</LinkInterno>
          )}
        </div>
      </div>

      {m?.bloqueada && (
        <div role="note" className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bd)", color: "var(--danger-fg)" }}>
          <p className="font-semibold">
            Bloqueada{m.atualizadoPor?.nome ? ` por ${m.atualizadoPor.nome}` : ""}{m.atualizadoEm ? ` · ${formatDatetime(m.atualizadoEm)}` : ""}
          </p>
          {m.motivo && <p className="mt-0.5">{m.motivo}</p>}
          <p className="text-xs mt-1">Não consegue entrar na app nem no portal, e as sessões abertas deixaram de funcionar.</p>
        </div>
      )}
      {m?.anonimizada && (
        <div role="note" className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--gray-100)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
          <p className="font-semibold" style={{ color: "var(--text)" }}>
            Apagada e anonimizada{m.anonimizadoPor?.nome ? ` por ${m.anonimizadoPor.nome}` : ""}{m.anonimizadoEm ? ` · ${formatDatetime(m.anonimizadoEm)}` : ""}
          </p>
          {m.motivoApagar && <p className="mt-0.5">{m.motivoApagar}</p>}
          <p className="text-xs mt-1">Os dados pessoais saíram da conta. As reservas e os pagamentos ficam no histórico.</p>
        </div>
      )}

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
                      {v.oculta && <Etiqueta tom="aviso">Oculta pela equipa</Etiqueta>}
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

      <AcaoComMotivo
        aberto={bloquear}
        onFechar={() => setBloquear(false)}
        titulo={`Bloquear a conta de ${nome}?`}
        descricao={
          "Deixa logo de conseguir entrar, e as sessões abertas param de funcionar. Recebe o motivo por email. " +
          (u.tipo === "parceiro" ? "Os anúncios continuam na app: para os tirar, suspende os espaços. " : "") +
          "Podes desbloquear depois."
        }
        rotulo="Bloquear conta"
        perigo
        ajuda="O titular recebe este texto por email."
        placeholder="Ex.: várias reservas falsas feitas com esta conta."
        onConfirmar={confirmarBloqueio}
      />

      <ConfirmModal
        open={desbloquear}
        onOpenChange={(o) => !o && setDesbloquear(false)}
        title={`Desbloquear a conta de ${nome}?`}
        description="Volta a poder entrar na app e no portal, e recebe um email a dizê-lo."
        onConfirm={confirmarDesbloqueio}
        loading={aGravar}
        confirmLabel="Desbloquear conta"
        confirmVariant="primary"
      />

      <AcaoComMotivo
        aberto={apagar}
        onFechar={() => setApagar(false)}
        titulo={`Apagar a conta de ${nome}?`}
        descricao={`Tira da conta o nome, o email, o telefone, a foto e a ligação ao Google${u.agenciaId ? ", e do perfil de parceiro o NIF, o IBAN e a morada" : ""}. As ${a.reservasTotal.quantidade} reservas e os pagamentos ficam no histórico, sem os dados pessoais. Não se desfaz.`}
        rotulo="Apagar e anonimizar"
        perigo
        ajuda="Fica registado; o titular não é avisado."
        placeholder="Ex.: o titular pediu para apagar os dados."
        confirmarCom="APAGAR"
        impedimento={textoImpedimentos(a.impedimentosApagar)}
        onConfirmar={confirmarApagar}
      />
    </PageShell>
  );
}
