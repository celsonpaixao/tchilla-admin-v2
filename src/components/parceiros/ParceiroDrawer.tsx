"use client";
import { useEffect, useState, useTransition } from "react";
import { Check, Mail, Phone, X } from "lucide-react";
import { toast } from "sonner";
import type { EstadoParceiro, ParceiroAdmin, ParceiroDetalhe } from "@/types/agencia.types";
import { aprovarParceiro, fetchParceiro, rejeitarParceiro, suspenderParceiro } from "@/actions/agencia.actions";
import { GlobalDrawer } from "@/components/global/GlobalDrawer";
import { ConfirmModal, GlobalModal } from "@/components/global/GlobalModal";
import { GlobalButton } from "@/components/global/GlobalButton";
import { StatusBadge } from "@/components/global/StatusBadge";
import { CampoMotivo, ErroCarregamento } from "@/components/global/FiltrosUI";
import { formatDate, formatDatetime } from "@/lib/utils";
import { fetchAnunciosParceiro } from "@/actions/admin.actions";
import type { AnunciosParceiro } from "@/types/admin.types";
import { LinkInterno } from "@/components/admin/AdminUI";
import { ROUTES } from "@/constants/routes";

const MOTIVO_MIN = 5;

const NOMES_ESTADO_ESPACO: Record<string, string> = { Rascunho: "Rascunho", EmRevisao: "Em revisão", Publicado: "Publicado", Suspenso: "Suspenso", Inativo: "Inativo" };

type Acao = "aprovar" | "rejeitar" | "suspender";

interface ParceiroDrawerProps {
  parceiro: ParceiroAdmin | null;
  onClose: () => void;
  onDecidido: (atualizado: ParceiroAdmin) => void;
}

export function nomeParceiro(p: Pick<ParceiroAdmin, "nomeComercial" | "responsavel" | "id">) {
  return p.nomeComercial?.trim() || p.responsavel.nome?.trim() || `Parceiro #${p.id}`;
}

function Seccao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{titulo}</h3>
      {children}
    </section>
  );
}

function ItemPerfil({ ok, label, detalhe }: { ok: boolean; label: string; detalhe?: string | null }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span
        className="mt-0.5 w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0"
        style={{ background: ok ? "var(--success-bg)" : "var(--warning-bg)", color: ok ? "var(--success-fg)" : "var(--warning-fg)" }}
        aria-hidden
      >
        {ok ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
      </span>
      <span style={{ color: "var(--text)" }}>
        {label}
        <span className="sr-only">{ok ? ": preenchido" : ": em falta"}</span>
        {detalhe && <span className="block text-xs break-all" style={{ color: "var(--text-3)" }}>{detalhe}</span>}
        {!ok && <span className="block text-xs" style={{ color: "var(--warning-fg)" }}>Em falta</span>}
      </span>
    </li>
  );
}

function ListaAnuncios({ titulo, itens, total }: { titulo: string; itens: ParceiroDetalhe["espacos"]; total: number }) {
  return (
    <div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
        {titulo} <span style={{ color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>· {total}</span>
      </p>
      {itens.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--text-3)" }}>Nenhum.</p>
      ) : (
        <ul className="space-y-1">
          {itens.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate" style={{ color: "var(--text-2)" }}>{a.nome || `#${a.id}`}</span>
              {a.estado && <span className="text-xs flex-shrink-0" style={{ color: "var(--text-3)" }}>{a.estado}</span>}
            </li>
          ))}
          {total > itens.length && (
            <li className="text-xs" style={{ color: "var(--text-3)" }}>e mais {total - itens.length}.</li>
          )}
        </ul>
      )}
    </div>
  );
}

export function ParceiroDrawer({ parceiro, onClose, onDecidido }: ParceiroDrawerProps) {
  const [detalhe, setDetalhe] = useState<ParceiroDetalhe | null>(null);
  const [anuncios, setAnuncios] = useState<AnunciosParceiro | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aCarregar, setACarregar] = useState(false);
  const [acao, setAcao] = useState<Acao | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [aGravar, startGravar] = useTransition();

  const id = parceiro?.id;

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    setDetalhe(null);
    setErro(null);
    setACarregar(true);
    setAnuncios(null);
    fetchParceiro(id).then((res) => {
      if (!ativo) return;
      if (res.success) setDetalhe(res.data);
      else setErro(res.error);
      setACarregar(false);
    });
    // Mais completo (reservas por anúncio, suspensões, eventos); se falhar fica a lista do detalhe.
    fetchAnunciosParceiro(id).then((res) => ativo && res.success && setAnuncios(res.data));
    return () => { ativo = false; };
  }, [id]);

  const p: ParceiroAdmin | null = detalhe ?? parceiro;
  const nome = p ? nomeParceiro(p) : "";

  function abrir(a: Acao) {
    setMotivo("");
    setErroAcao(null);
    setAcao(a);
  }

  function confirmar() {
    if (!p || !acao) return;
    const texto = motivo.trim();
    if (acao !== "aprovar" && texto.length < MOTIVO_MIN) {
      setErroAcao(`Escreve o motivo (pelo menos ${MOTIVO_MIN} caracteres) — o parceiro vai lê-lo.`);
      return;
    }
    startGravar(async () => {
      const res =
        acao === "aprovar" ? await aprovarParceiro(p.id) :
        acao === "rejeitar" ? await rejeitarParceiro(p.id, texto) :
        await suspenderParceiro(p.id, texto);
      if (!res.success) {
        setErroAcao(res.error);
        if (acao === "aprovar") toast.error("Não foi possível aprovar", { description: res.error });
        return;
      }
      setAcao(null);
      setDetalhe((d) => (d ? { ...d, ...res.data } : d));
      onDecidido(res.data);
      const titulo =
        acao === "aprovar" ? `${nome} aprovado` :
        acao === "rejeitar" ? `${nome} rejeitado` :
        `${nome} suspenso`;
      toast.success(titulo, { description: "O parceiro foi avisado por notificação e email." });
    });
  }

  const estado: EstadoParceiro | undefined = p?.estado;
  const footer = p && (
    <>
      {estado === "Pendente" && (
        <>
          <GlobalButton variant="secondary" onClick={() => abrir("rejeitar")}>Rejeitar</GlobalButton>
          <GlobalButton variant="primary" onClick={() => abrir("aprovar")}>Aprovar parceiro</GlobalButton>
        </>
      )}
      {estado === "Rejeitado" && <GlobalButton variant="primary" onClick={() => abrir("aprovar")}>Aprovar parceiro</GlobalButton>}
      {estado === "Suspenso" && <GlobalButton variant="primary" onClick={() => abrir("aprovar")}>Reativar parceiro</GlobalButton>}
      {estado === "Aprovado" && <GlobalButton variant="secondary" onClick={() => abrir("suspender")}>Suspender</GlobalButton>}
    </>
  );

  return (
    <>
      <GlobalDrawer
        open={!!parceiro}
        onOpenChange={(o) => !o && onClose()}
        title={nome}
        description={p ? `Registado em ${formatDate(p.criadoEm)}${p.tipo ? ` · ${p.tipo}` : ""}` : undefined}
        width="md"
        footer={footer}
      >
        {p && (
          <div className="space-y-6">
            <Seccao titulo="Estado">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={p.estado} />
                {p.estadoAtualizadoEm && (
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>
                    {formatDatetime(p.estadoAtualizadoEm)}{p.estadoAtualizadoPor ? ` · por ${p.estadoAtualizadoPor}` : ""}
                  </span>
                )}
              </div>
              {p.motivo && (
                <p className="text-sm rounded-lg px-3 py-2" style={{ background: "var(--gray-50)", color: "var(--text-2)" }}>
                  <span className="font-medium">Motivo:</span> {p.motivo}
                </p>
              )}
              {p.estado === "Rejeitado" && (
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  Volta a “Por aprovar” sozinho quando o parceiro atualizar o perfil.
                </p>
              )}
            </Seccao>

            <Seccao titulo="Responsável">
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{p.responsavel.nome || "Sem nome"}</p>
              <div className="space-y-1 text-sm">
                {p.responsavel.email && (
                  <a href={`mailto:${p.responsavel.email}`} className="flex items-center gap-2 break-all" style={{ color: "var(--blue-700)" }}>
                    <Mail size={14} className="flex-shrink-0" /> {p.responsavel.email}
                  </a>
                )}
                {p.responsavel.telefone && (
                  <a href={`tel:${p.responsavel.telefone}`} className="flex items-center gap-2" style={{ color: "var(--blue-700)" }}>
                    <Phone size={14} className="flex-shrink-0" /> {p.responsavel.telefone}
                  </a>
                )}
              </div>
            </Seccao>

            <Seccao titulo={`Perfil · ${p.perfil.preenchidos}/${p.perfil.total}`}>
              <ul className="space-y-2">
                <ItemPerfil ok={p.perfil.contaVerificada} label="Conta verificada (código SMS/email)" />
                <ItemPerfil ok={p.perfil.nif} label="NIF" detalhe={p.nif} />
                <ItemPerfil ok={p.perfil.descricao} label="Descrição" detalhe={p.descricao} />
                <ItemPerfil
                  ok={p.perfil.iban}
                  label="Conta bancária (IBAN)"
                  detalhe={detalhe?.contasBancarias.filter((c) => c.iban).map((c) => [c.banco, c.iban].filter(Boolean).join(" · ")).join("; ") || null}
                />
                <ItemPerfil ok={p.perfil.endereco} label="Endereço" detalhe={detalhe?.endereco} />
                <ItemPerfil ok={p.perfil.foto} label="Foto de perfil" />
              </ul>
            </Seccao>

            <Seccao titulo={`Anúncios · ${p.anuncios.total}`}>
              {aCarregar && (
                <div className="space-y-2" aria-label="A carregar anúncios">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              )}
              {erro && <ErroCarregamento mensagem={erro} onRetry={() => { setErro(null); setDetalhe(null); fetchParceiro(p.id).then((r) => r.success ? setDetalhe(r.data) : setErro(r.error)); }} />}
              {anuncios ? (
                <div className="space-y-3">
                  <ListaAnuncios
                    titulo="Espaços"
                    total={anuncios.espacos.length}
                    itens={anuncios.espacos.map((e) => ({ id: e.id, nome: e.nome ?? "", estado: `${e.suspenso ? "Suspenso" : NOMES_ESTADO_ESPACO[e.estado] ?? e.estado} · ${e.reservas} reservas` }))}
                  />
                  <ListaAnuncios
                    titulo="Serviços"
                    total={anuncios.servicos.length}
                    itens={anuncios.servicos.map((s) => ({ id: s.id, nome: s.nome ?? "", estado: `${s.reservas} reservas` }))}
                  />
                  <ListaAnuncios
                    titulo="Combos"
                    total={anuncios.combos.length}
                    itens={anuncios.combos.map((c) => ({ id: c.id, nome: c.nome ?? "", estado: c.estado ?? "" }))}
                  />
                  {anuncios.eventos.length > 0 && (
                    <ListaAnuncios
                      titulo="Eventos"
                      total={anuncios.eventos.length}
                      itens={anuncios.eventos.map((e) => ({ id: e.id, nome: e.nome ?? "", estado: `${e.bilhetesVendidos} bilhetes` }))}
                    />
                  )}
                </div>
              ) : detalhe && (
                <div className="space-y-3">
                  <ListaAnuncios titulo="Espaços" itens={detalhe.espacos} total={detalhe.anuncios.espacos} />
                  <ListaAnuncios titulo="Serviços" itens={detalhe.servicos} total={detalhe.anuncios.servicos} />
                  <ListaAnuncios titulo="Combos" itens={detalhe.combos} total={detalhe.anuncios.combos} />
                </div>
              )}
            </Seccao>

            <Seccao titulo="Ver também">
              <ul className="space-y-1.5 text-sm">
                <li><LinkInterno href={`${ROUTES.RESERVAS.LISTAGEM}?agencia=${p.id}`}>Reservas deste parceiro</LinkInterno></li>
                <li><LinkInterno href={`${ROUTES.GESTAO.CATALOGO}?agencia=${p.id}`}>Serviços no catálogo</LinkInterno></li>
                <li><LinkInterno href={`${ROUTES.GESTAO.AVALIACOES}?agencia=${p.id}`}>Avaliações dos anúncios</LinkInterno></li>
                <li><LinkInterno href={ROUTES.FINANCEIRO.POR_PARCEIRO}>Financeiro por parceiro</LinkInterno></li>
              </ul>
            </Seccao>
          </div>
        )}
      </GlobalDrawer>

      {/* Aprovar / reativar */}
      <ConfirmModal
        open={acao === "aprovar"}
        onOpenChange={(o) => !o && setAcao(null)}
        title={p ? `${estado === "Suspenso" ? "Reativar" : "Aprovar"} ${nome}?` : ""}
        description={
          p
            ? `${p.perfil.preenchidos < p.perfil.total ? `O perfil tem ${p.perfil.total - p.perfil.preenchidos} ${p.perfil.total - p.perfil.preenchidos === 1 ? "item" : "itens"} em falta. ` : ""}O parceiro é avisado por notificação e email.` +
              (erroAcao ? ` ${erroAcao}` : "")
            : ""
        }
        onConfirm={confirmar}
        loading={aGravar}
        confirmLabel={estado === "Suspenso" ? "Reativar parceiro" : "Aprovar parceiro"}
        confirmVariant="primary"
      />

      {/* Rejeitar / suspender (motivo obrigatório) */}
      <GlobalModal
        open={acao === "rejeitar" || acao === "suspender"}
        onOpenChange={(o) => !o && setAcao(null)}
        title={p ? `${acao === "suspender" ? "Suspender" : "Rejeitar"} ${nome}?` : ""}
        description={
          acao === "suspender"
            ? "O parceiro deixa de estar aprovado e recebe o motivo. Pode ser reativado depois."
            : "O parceiro recebe o motivo e volta à fila quando atualizar o perfil."
        }
        size="md"
        footer={
          <>
            <GlobalButton variant="secondary" onClick={() => setAcao(null)} disabled={aGravar}>Voltar</GlobalButton>
            <GlobalButton variant="danger" onClick={confirmar} loading={aGravar}>
              {acao === "suspender" ? "Suspender parceiro" : "Rejeitar parceiro"}
            </GlobalButton>
          </>
        }
      >
        <CampoMotivo
          id="motivo-parceiro"
          valor={motivo}
          onChange={(v) => { setMotivo(v); if (erroAcao) setErroAcao(null); }}
          erro={erroAcao}
          ajuda="O parceiro recebe este texto por notificação e email."
          placeholder={acao === "suspender" ? "Ex.: reclamações repetidas de clientes por falta de comparência." : "Ex.: falta o NIF e o IBAN para recebermos os pagamentos."}
        />
      </GlobalModal>
    </>
  );
}
