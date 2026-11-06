"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActionResult } from "@/types/common.types";
import type { Paginado } from "@/types/payment.types";
import type { FiltroParceiros, ParceiroAdmin, ResumoParceiros } from "@/types/agencia.types";
import { GlobalTable } from "@/components/global/GlobalTable";
import { GlobalUserAvatarName } from "@/components/global/GlobalAvatar";
import { GlobalButton } from "@/components/global/GlobalButton";
import { StatusBadge } from "@/components/global/StatusBadge";
import { PageShell } from "@/components/global/PageShell";
import { ErroCarregamento, FilterTabs, ToolbarInput } from "@/components/global/FiltrosUI";
import { useFiltrosUrl } from "@/hooks/useFiltrosUrl";
import { formatDate } from "@/lib/utils";
import { TABS_PARCEIROS, type TabParceiros } from "./filtros";
import { ParceiroDrawer, nomeParceiro } from "./ParceiroDrawer";

interface ParceirosPageProps {
  tab: TabParceiros;
  filtro: FiltroParceiros;
  lista: ActionResult<Paginado<ParceiroAdmin>>;
  resumo: ActionResult<ResumoParceiros>;
}

function vazio(tab: TabParceiros, comPesquisa: boolean) {
  if (comPesquisa) return "Nenhum parceiro corresponde à pesquisa. Experimenta o nome comercial, o email ou o NIF.";
  switch (tab) {
    case "pendentes": return "Nenhum parceiro por aprovar. Quando uma agência nova se registar, aparece aqui.";
    case "aprovados": return "Ainda não há parceiros aprovados.";
    case "rejeitados": return "Nenhum parceiro rejeitado.";
    case "suspensos": return "Nenhum parceiro suspenso.";
    default: return "Ainda não há parceiros registados.";
  }
}

export function ParceirosPage({ tab, filtro, lista, resumo }: ParceirosPageProps) {
  const { atualizar, recarregar, isPending, queryAtual } = useFiltrosUrl();
  const [parceiros, setParceiros] = useState<ParceiroAdmin[]>(lista.success ? lista.data.data : []);
  const [pesquisa, setPesquisa] = useState(filtro.pesquisa ?? "");
  const [aberto, setAberto] = useState<ParceiroAdmin | null>(null);

  useEffect(() => {
    setParceiros(lista.success ? lista.data.data : []);
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

  function decidido(atualizado: ParceiroAdmin) {
    setParceiros((prev) => prev.map((p) => (p.id === atualizado.id ? { ...p, ...atualizado } : p)));
    setAberto((a) => (a && a.id === atualizado.id ? { ...a, ...atualizado } : a));
    recarregar();
  }

  const columns: ColumnDef<ParceiroAdmin, unknown>[] = [
    {
      id: "parceiro",
      header: "Parceiro",
      cell: ({ row }) => (
        <div className="max-w-[220px]">
          <GlobalUserAvatarName
            name={nomeParceiro(row.original)}
            photo={row.original.responsavel.foto}
            subtitle={row.original.responsavel.nome ?? undefined}
          />
        </div>
      ),
    },
    {
      id: "contacto",
      header: "Contacto",
      cell: ({ row }) => {
        const r = row.original.responsavel;
        return (
          <div className="min-w-0 max-w-[200px]" title={r.email ?? undefined}>
            <p className="truncate" style={{ color: "var(--text)" }}>{r.email || "—"}</p>
            {r.telefone && <p className="text-xs" style={{ color: "var(--text-3)" }}>{r.telefone}</p>}
          </div>
        );
      },
    },
    {
      id: "anuncios",
      header: () => <span className="block w-full text-right">Anúncios</span>,
      cell: ({ row }) => {
        const a = row.original.anuncios;
        return (
          <span
            className="block text-right"
            style={{ fontVariantNumeric: "tabular-nums", color: a.total ? "var(--text)" : "var(--text-3)" }}
            title={`${a.espacos} espaços · ${a.servicos} serviços · ${a.combos} combos`}
          >
            {a.total}
          </span>
        );
      },
    },
    {
      id: "perfil",
      header: "Perfil",
      cell: ({ row }) => {
        const p = row.original.perfil;
        const completo = p.preenchidos === p.total;
        return (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap"
            style={{ color: completo ? "var(--success-fg)" : "var(--warning-fg)", fontVariantNumeric: "tabular-nums" }}
            title="NIF, descrição, IBAN, endereço, foto e conta verificada"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
            {completo ? "Completo" : `${p.preenchidos}/${p.total} preenchido`}
          </span>
        );
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      accessorKey: "criadoEm",
      header: "Registado",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap" style={{ fontVariantNumeric: "tabular-nums" }}>{formatDate(getValue() as string)}</span>
      ),
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <GlobalButton size="sm" variant="secondary" onClick={() => setAberto(row.original)}>
            {row.original.estado === "Pendente" ? "Analisar" : "Ver"}
          </GlobalButton>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Parceiros"
      subtitle={r ? `${r.total} ${r.total === 1 ? "parceiro" : "parceiros"} · ${r.pendentes} por aprovar` : undefined}
    >
      {!resumo.success && <ErroCarregamento mensagem={resumo.error} onRetry={recarregar} />}

      <FilterTabs
        tabs={TABS_PARCEIROS}
        ativa={tab}
        onChange={(id) => atualizar({ tab: id === "pendentes" ? undefined : id })}
        contadores={r ? { pendentes: r.pendentes } : undefined}
      />

      {!lista.success ? (
        <ErroCarregamento mensagem={lista.error} onRetry={recarregar} />
      ) : (
        <GlobalTable
          data={parceiros}
          columns={columns}
          isLoading={isPending}
          emptyMessage={
            <div className="space-y-2">
              <p>{vazio(tab, !!filtro.pesquisa)}</p>
              {tab === "pendentes" && !filtro.pesquisa && r && r.aprovados > 0 && (
                <button className="text-sm font-semibold cursor-pointer" style={{ color: "var(--blue-700)" }} onClick={() => atualizar({ tab: "aprovados" })}>
                  Ver os {r.aprovados} aprovados
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
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }} />
              <ToolbarInput
                type="search"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Nome comercial, responsável, email ou NIF"
                aria-label="Pesquisar parceiros"
                style={{ width: "100%", paddingLeft: 32 }}
              />
            </div>
          }
        />
      )}

      <ParceiroDrawer parceiro={aberto} onClose={() => setAberto(null)} onDecidido={decidido} />
    </PageShell>
  );
}
