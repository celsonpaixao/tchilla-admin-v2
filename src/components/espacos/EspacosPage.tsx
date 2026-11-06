"use client";
import { useEffect, useState, useTransition } from "react";
import { ImageOff, Search } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import { TIPO_PRECO_LABELS, type EspacoAdmin, type FiltroEspacos, type ResumoEspacos } from "@/types/espaco.types";
import { reativarEspaco, suspenderEspaco } from "@/actions/espaco.actions";
import { GlobalTable } from "@/components/global/GlobalTable";
import { GlobalButton } from "@/components/global/GlobalButton";
import { StatusBadge } from "@/components/global/StatusBadge";
import { ConfirmModal, GlobalModal } from "@/components/global/GlobalModal";
import { PageShell } from "@/components/global/PageShell";
import { CampoMotivo, ErroCarregamento, FilterTabs, ToolbarInput } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { formatCurrencyAOA, formatDate, formatDatetime } from "@/lib/utils";
import { TABS_ESPACOS, type TabEspacos } from "./filtros";

interface EspacosPageProps {
  tab: TabEspacos;
  filtro: FiltroEspacos;
  lista: ActionResult<Paginado<EspacoAdmin>>;
  resumo: ActionResult<ResumoEspacos>;
}

const MOTIVO_MIN = 5;

function vazio(tab: TabEspacos, comPesquisa: boolean) {
  if (comPesquisa) return "Nenhum espaço corresponde à pesquisa. Experimenta o nome do espaço, do parceiro ou o nº.";
  switch (tab) {
    case "publicados": return "Não há espaços publicados — os clientes não veem nenhum na app.";
    case "suspensos": return "Nenhum espaço suspenso pela equipa.";
    case "rascunhos": return "Nenhum espaço em rascunho.";
    case "inativos": return "Nenhum espaço inativo.";
    default: return "Ainda não há espaços registados.";
  }
}

function Capa({ url, nome }: { url?: string | null; nome?: string | null }) {
  const [falhou, setFalhou] = useState(false);
  const estilo: React.CSSProperties = { width: 44, height: 32, borderRadius: "var(--r-sm)", flexShrink: 0, objectFit: "cover" };
  if (!url || falhou)
    return (
      <span className="flex items-center justify-center" style={{ ...estilo, background: "var(--gray-100)", color: "var(--text-3)" }} aria-hidden>
        <ImageOff size={14} />
      </span>
    );
  // eslint-disable-next-line @next/next/no-img-element -- imagens de vários domínios (R2, Unsplash…)
  return <img src={url} alt={nome ? `Capa de ${nome}` : ""} loading="lazy" style={estilo} onError={() => setFalhou(true)} />;
}

export function EspacosPage({ tab, filtro, lista, resumo }: EspacosPageProps) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [espacos, setEspacos] = useState<EspacoAdmin[]>(lista.success ? lista.data.data : []);
  const [pesquisa, setPesquisa] = useState(filtro.pesquisa ?? "");
  const [suspenderAlvo, setSuspenderAlvo] = useState<EspacoAdmin | null>(null);
  const [reativarAlvo, setReativarAlvo] = useState<EspacoAdmin | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [aGravar, startGravar] = useTransition();

  useEffect(() => {
    setEspacos(lista.success ? lista.data.data : []);
  }, [lista]);

  useEffect(() => {
    const t = setTimeout(() => {
      const atual = queryAtual().get("q") ?? "";
      if (atual !== pesquisa.trim()) atualizar({ q: pesquisa.trim() || undefined });
    }, 400);
    return () => clearTimeout(t);
  }, [pesquisa, atualizar, queryAtual]);

  const pagina = lista.success ? lista.data : null;
  const r = resumo.success ? resumo.data : null;

  function fechar() {
    setSuspenderAlvo(null);
    setReativarAlvo(null);
    setMotivo("");
    setErroAcao(null);
  }

  function substituir(e: EspacoAdmin) {
    setEspacos((prev) => prev.map((x) => (x.id === e.id ? e : x)));
  }

  function confirmarSuspensao() {
    if (!suspenderAlvo) return;
    const texto = motivo.trim();
    if (texto.length < MOTIVO_MIN) {
      setErroAcao(`Escreve o motivo (pelo menos ${MOTIVO_MIN} caracteres) — o parceiro vai lê-lo.`);
      return;
    }
    const alvo = suspenderAlvo;
    startGravar(async () => {
      const res = await suspenderEspaco(alvo.id, texto);
      if (!res.success) {
        setErroAcao(res.error);
        return;
      }
      substituir(res.data);
      fechar();
      toast.success(`“${alvo.nome}” suspenso`, { description: "Saiu da app e o parceiro foi avisado." });
      recarregar();
    });
  }

  function confirmarReativacao() {
    if (!reativarAlvo) return;
    const alvo = reativarAlvo;
    startGravar(async () => {
      const res = await reativarEspaco(alvo.id);
      if (!res.success) {
        toast.error("Não foi possível reativar", { description: res.error });
        return;
      }
      substituir(res.data);
      fechar();
      toast.success(`“${alvo.nome}” reativado`, {
        description: res.data.status === "Publicado" ? "Voltou a aparecer na app." : `Voltou ao estado ${res.data.status}.`,
      });
      recarregar();
    });
  }

  const columns: ColumnDef<EspacoAdmin, unknown>[] = [
    {
      id: "espaco",
      header: "Espaço",
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-0 max-w-[220px]">
            <Capa url={e.capaUrl} nome={e.nome} />
            <div className="min-w-0">
              <p className="font-medium truncate" style={{ color: "var(--text)" }} title={e.nome ?? undefined}>{e.nome || `Espaço #${e.id}`}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
                <span style={{ fontFamily: "var(--mono)" }}>#{e.id}</span>
                {e.cidade ? ` · ${e.cidade}` : ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "agencia",
      header: "Parceiro",
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.agencia || `Agência #${row.original.agenciaId}`}</span>,
    },
    {
      accessorKey: "precoBase",
      header: () => <span className="block w-full text-right">Preço base</span>,
      cell: ({ row }) => (
        <span className="block text-right whitespace-nowrap" style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatCurrencyAOA(row.original.precoBase)}
          <span className="text-xs" style={{ color: "var(--text-3)" }}>{TIPO_PRECO_LABELS[row.original.tipoPreco ?? ""] ?? ""}</span>
        </span>
      ),
    },
    {
      accessorKey: "reservasFuturas",
      header: () => <span className="block w-full text-right">Reservas futuras</span>,
      cell: ({ row }) => (
        <span className="block text-right" style={{ fontVariantNumeric: "tabular-nums", color: row.original.reservasFuturas ? "var(--text)" : "var(--text-3)" }} title={`${row.original.reservasTotal} no total`}>
          {row.original.reservasFuturas}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const e = row.original;
        const pelaEquipa = e.suspensaoEquipa?.ativa;
        return (
          <div>
            <StatusBadge status={e.status} />
            {pelaEquipa && (
              <p className="text-xs mt-0.5 max-w-[200px] truncate" style={{ color: "var(--text-3)" }} title={e.suspensaoEquipa?.motivo ?? undefined}>
                Pela equipa · {e.suspensaoEquipa?.motivo}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "atualizado",
      header: "Atualizado",
      cell: ({ row }) => {
        const d = row.original.atualizadoEm ?? row.original.criadoEm;
        return <span className="whitespace-nowrap" title={formatDatetime(d)} style={{ fontVariantNumeric: "tabular-nums" }}>{formatDate(d)}</span>;
      },
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="flex justify-end">
            {e.suspensaoEquipa?.ativa ? (
              <GlobalButton size="sm" variant="secondary" onClick={() => { setErroAcao(null); setReativarAlvo(e); }}>Reativar</GlobalButton>
            ) : (
              <GlobalButton size="sm" variant="ghost" onClick={() => { setMotivo(""); setErroAcao(null); setSuspenderAlvo(e); }}>Suspender</GlobalButton>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageShell
      title="Espaços"
      subtitle={
        r
          ? `${r.total} ${r.total === 1 ? "espaço" : "espaços"} · ${r.publicado} ${r.publicado === 1 ? "publicado" : "publicados"} · ` +
            `${r.suspensosPelaEquipa} ${r.suspensosPelaEquipa === 1 ? "suspenso" : "suspensos"} pela equipa`
          : undefined
      }
    >
      {!resumo.success && <ErroCarregamento mensagem={resumo.error} onRetry={recarregar} />}

      <FilterTabs
        tabs={TABS_ESPACOS}
        ativa={tab}
        onChange={(id) => atualizar({ tab: id === "publicados" ? undefined : id })}
        contadores={r ? { suspensos: r.suspensosPelaEquipa } : undefined}
      />

      {!lista.success ? (
        <ErroCarregamento mensagem={lista.error} onRetry={recarregar} />
      ) : (
        <GlobalTable
          data={espacos}
          columns={columns}
          isLoading={isPending}
          emptyMessage={vazio(tab, !!filtro.pesquisa)}
          serverPagination={{
            page: pagina!.pageNumber,
            pageSize: pagina!.pageSize,
            totalItems: pagina!.totalItems,
            totalPages: pagina!.totalPages,
            onPageChange: (p) => atualizar({ pagina: p > 1 ? p : undefined }),
          }}
          toolbar={
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }} />
              <ToolbarInput
                type="search"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Nome do espaço, parceiro ou nº"
                aria-label="Pesquisar espaços"
                style={{ width: "100%", paddingLeft: 32 }}
              />
            </div>
          }
        />
      )}

      {/* Suspender (motivo obrigatório) */}
      <GlobalModal
        open={!!suspenderAlvo}
        onOpenChange={(o) => !o && fechar()}
        title={suspenderAlvo ? `Suspender “${suspenderAlvo.nome}”?` : ""}
        description={
          suspenderAlvo
            ? `Sai logo da pesquisa e da home da app, e ${suspenderAlvo.agencia ?? "o parceiro"} recebe o motivo. ` +
              (suspenderAlvo.reservasFuturas
                ? `As ${suspenderAlvo.reservasFuturas} ${suspenderAlvo.reservasFuturas === 1 ? "reserva futura mantém-se" : "reservas futuras mantêm-se"} — trata-as à parte se for preciso.`
                : "Não tem reservas futuras.")
            : ""
        }
        size="md"
        footer={
          <>
            <GlobalButton variant="secondary" onClick={fechar} disabled={aGravar}>Voltar</GlobalButton>
            <GlobalButton variant="danger" onClick={confirmarSuspensao} loading={aGravar}>Suspender espaço</GlobalButton>
          </>
        }
      >
        <CampoMotivo
          id="motivo-espaco"
          valor={motivo}
          onChange={(v) => { setMotivo(v); if (erroAcao) setErroAcao(null); }}
          erro={erroAcao}
          ajuda="O parceiro recebe este texto por notificação e email."
          placeholder="Ex.: as fotos não correspondem ao espaço anunciado."
        />
      </GlobalModal>

      {/* Reativar */}
      <ConfirmModal
        open={!!reativarAlvo}
        onOpenChange={(o) => !o && fechar()}
        title={reativarAlvo ? `Reativar “${reativarAlvo.nome}”?` : ""}
        description={
          reativarAlvo
            ? `Volta ao estado que tinha antes da suspensão (normalmente Publicado, a aparecer na app). ${reativarAlvo.agencia ?? "O parceiro"} é avisado.`
            : ""
        }
        onConfirm={confirmarReativacao}
        loading={aGravar}
        confirmLabel="Reativar espaço"
        confirmVariant="primary"
      />
    </PageShell>
  );
}
