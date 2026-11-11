"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AlterarTaxas, ChaveTaxa, ConfiguracoesPlataforma } from "@/types/admin.types";
import { alterarTaxas } from "@/actions/admin.actions";
import { GlobalButton } from "@/components/global/GlobalButton";
import { GlobalModal } from "@/components/global/GlobalModal";
import { formatCurrencyAOA, formatDatetime } from "@/lib/utils";

const pct = (v: number) => `${v.toLocaleString("pt-AO", { maximumFractionDigits: 2 })}%`;

type CampoTaxa = "taxaClientePercent" | "comissaoParceiroPercent" | "taxaProcessamentoPercent" | "comissaoTransferenciaPercent";

const CAMPO: Record<ChaveTaxa, CampoTaxa> = {
  TaxaClientePercent: "taxaClientePercent",
  ComissaoParceiroPercent: "comissaoParceiroPercent",
  TaxaProcessamentoPercent: "taxaProcessamentoPercent",
  ComissaoTransferenciaPercent: "comissaoTransferenciaPercent",
};

const AJUDA: Record<ChaveTaxa, string> = {
  TaxaClientePercent: "Somada ao valor da reserva em cada pagamento Momenu.",
  ComissaoParceiroPercent: "Multicaixa Express e referência, quando o parceiro tem IBAN e NIF.",
  TaxaProcessamentoPercent: "Descontado do total antes de dividir com o parceiro.",
  ComissaoTransferenciaPercent: "O parceiro paga-a depois de receber a transferência.",
};

interface TaxasPlataformaProps {
  config: ConfiguracoesPlataforma | null;
  erro?: string;
  /** Só um Admin altera as taxas (a API decide; isto só esconde o botão). */
  podeAlterar: boolean;
}

/** Taxas e comissões em vigor; um Admin pode alterá-las (valem para os pagamentos novos). */
export function TaxasPlataforma({ config, erro, podeAlterar }: TaxasPlataformaProps) {
  const [editar, setEditar] = useState(false);

  const linhas = config
    ? [
        { label: "Taxa de serviço do cliente", valor: pct(config.taxaClientePercent), ajuda: AJUDA.TaxaClientePercent },
        { label: "Comissão Tchilla no split", valor: pct(config.comissaoParceiroPercent), ajuda: AJUDA.ComissaoParceiroPercent },
        { label: "Custo de processamento", valor: pct(config.taxaProcessamentoPercent), ajuda: AJUDA.TaxaProcessamentoPercent },
        { label: "Comissão nas transferências", valor: pct(config.comissaoTransferenciaPercent), ajuda: AJUDA.ComissaoTransferenciaPercent },
        { label: "Mínimo por parte no split", valor: formatCurrencyAOA(config.minimoPorParteSplit), ajuda: "Abaixo disto o pagamento segue sem split. Fixo no servidor." },
        { label: "Transferência bancária", valor: config.transferenciaAtiva ? "Ativa" : "Desligada", ajuda: "Pagamento por comprovativo, validado à mão. Fixo no servidor." },
      ]
    : [];

  const origem = !config
    ? "Valores em vigor no servidor."
    : config.origem === "painel"
      ? `Alteradas no painel${config.atualizadoPor?.nome ? ` por ${config.atualizadoPor.nome}` : ""}${config.atualizadoEm ? ` em ${formatDatetime(config.atualizadoEm)}` : ""}.`
      : "Valores de origem do servidor: ainda ninguém os alterou no painel.";

  return (
    <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Taxas da plataforma</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            {origem}
            {config && ` Ambiente ${config.ambiente}${config.momenuAmbienteQa ? " · Momenu em testes" : ""}.`}
          </p>
        </div>
        {config && podeAlterar && <GlobalButton size="sm" variant="secondary" onClick={() => setEditar(true)}>Alterar taxas</GlobalButton>}
      </div>
      {erro ? (
        <p className="text-sm" role="alert" style={{ color: "var(--danger-fg)" }}>Não foi possível ler as taxas: {erro}</p>
      ) : (
        <dl className="divide-y" style={{ borderColor: "var(--border)" }}>
          {linhas.map((l) => (
            <div key={l.label} className="flex items-start justify-between gap-4 py-2">
              <dt className="text-sm" style={{ color: "var(--text)" }}>
                {l.label}
                <span className="block text-xs" style={{ color: "var(--text-3)" }}>{l.ajuda}</span>
              </dt>
              <dd className="text-sm font-semibold text-right" style={{ color: "var(--heading)", fontVariantNumeric: "tabular-nums" }}>{l.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {config && config.historico.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-xs font-semibold" style={{ color: "var(--blue-700)" }}>
            Histórico de alterações ({config.historico.length})
          </summary>
          <ul className="mt-2 space-y-2">
            {config.historico.map((h) => (
              <li key={h.id} className="text-xs" style={{ color: "var(--text-2)" }}>
                <span className="font-medium" style={{ color: "var(--text)" }}>
                  {config.limites.find((l) => l.chave === h.chave)?.nome ?? h.chave}: {pct(h.valorAnterior)} → {pct(h.valorNovo)}
                </span>
                <span className="block" style={{ color: "var(--text-3)" }}>
                  {formatDatetime(h.alteradoEm)}{h.alteradoPor?.nome ? ` · ${h.alteradoPor.nome}` : ""} · {h.nota}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {config && podeAlterar && <AlterarTaxasModal aberto={editar} onFechar={() => setEditar(false)} config={config} />}
    </div>
  );
}

function AlterarTaxasModal({ aberto, onFechar, config }: { aberto: boolean; onFechar: () => void; config: ConfiguracoesPlataforma }) {
  const router = useRouter();
  const [valores, setValores] = useState<Partial<Record<ChaveTaxa, string>>>({});
  const [nota, setNota] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, startGravar] = useTransition();

  useEffect(() => {
    if (!aberto) return;
    setValores(Object.fromEntries(config.limites.map((l) => [l.chave, String(config[CAMPO[l.chave]])])));
    setNota("");
    setErro(null);
  }, [aberto, config]);

  function confirmar() {
    const pedido: AlterarTaxas = { nota: nota.trim() };
    for (const l of config.limites) {
      const texto = (valores[l.chave] ?? "").replace(",", ".").trim();
      const numero = Number(texto);
      if (texto === "" || !Number.isFinite(numero)) return setErro(`${l.nome}: indica um número.`);
      if (numero < l.min || numero > l.max) return setErro(`${l.nome}: tem de estar entre ${l.min} e ${l.max}%.`);
      if (l.inteiro && !Number.isInteger(numero)) return setErro(`${l.nome}: tem de ser um número inteiro.`);
      if (numero !== config[CAMPO[l.chave]]) pedido[CAMPO[l.chave]] = numero;
    }
    if (config.limites.every((l) => pedido[CAMPO[l.chave]] === undefined)) return setErro("Nenhuma taxa mudou.");
    if (pedido.nota.length < 5) return setErro("Explica a mudança (pelo menos 5 caracteres). Fica no histórico.");

    startGravar(async () => {
      const res = await alterarTaxas(pedido);
      if (!res.success) return setErro(res.error);
      onFechar();
      toast.success("Taxas alteradas", { description: res.mensagem });
      router.refresh();
    });
  }

  const estilo = { border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)" } as const;

  return (
    <GlobalModal
      open={aberto}
      onOpenChange={(o) => !o && !aGravar && onFechar()}
      title="Alterar as taxas da plataforma"
      description="Valem para os pagamentos criados a partir de agora. Os pagamentos e as comissões que já existem mantêm as taxas com que foram feitos."
      size="lg"
      footer={
        <>
          <GlobalButton variant="secondary" onClick={onFechar} disabled={aGravar}>Voltar</GlobalButton>
          <GlobalButton variant="primary" onClick={confirmar} loading={aGravar}>Guardar taxas</GlobalButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {config.limites.map((l) => (
          <div key={l.chave}>
            <label htmlFor={`taxa-${l.chave}`} className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>{l.nome} (%)</label>
            <input
              id={`taxa-${l.chave}`}
              inputMode="decimal"
              value={valores[l.chave] ?? ""}
              onChange={(e) => { setValores((v) => ({ ...v, [l.chave]: e.target.value })); setErro(null); }}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ ...estilo, fontVariantNumeric: "tabular-nums" }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
              Agora {pct(config[CAMPO[l.chave]])} · de {l.min} a {l.max}%{l.inteiro ? ", inteiro" : ""}
            </p>
          </div>
        ))}
        <div className="sm:col-span-2">
          <label htmlFor="taxas-nota" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
            Porquê a mudança <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <textarea id="taxas-nota" rows={2} maxLength={300} value={nota} onChange={(e) => { setNota(e.target.value); setErro(null); }} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y" style={estilo} placeholder="Ex.: nova tabela de preços aprovada a 1 de dezembro." />
          <p className="text-xs mt-1" style={{ color: erro ? "var(--danger-fg)" : "var(--text-3)" }} role={erro ? "alert" : undefined}>
            {erro ?? "Fica no histórico, com o teu nome."}
          </p>
        </div>
      </div>
    </GlobalModal>
  );
}
