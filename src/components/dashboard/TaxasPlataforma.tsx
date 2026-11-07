import type { ConfiguracoesPlataforma } from "@/types/admin.types";
import { formatCurrencyAOA } from "@/lib/utils";

const pct = (v: number) => `${v.toLocaleString("pt-AO", { maximumFractionDigits: 2 })}%`;

/** Taxas e comissões em vigor no back-end (só leitura: mudam-se na configuração do servidor). */
export function TaxasPlataforma({ config, erro }: { config: ConfiguracoesPlataforma | null; erro?: string }) {
  const linhas = config
    ? [
        { label: "Taxa de serviço do cliente", valor: pct(config.taxaClientePercent), ajuda: "Somada ao valor da reserva em cada pagamento Momenu." },
        { label: "Comissão Tchilla no split", valor: pct(config.comissaoParceiroPercent), ajuda: "Multicaixa Express e referência, quando o parceiro tem IBAN e NIF." },
        { label: "Custo de processamento", valor: pct(config.taxaProcessamentoPercent), ajuda: "Descontado do total antes de dividir com o parceiro." },
        { label: "Comissão nas transferências", valor: pct(config.comissaoTransferenciaPercent), ajuda: "O parceiro paga-a depois de receber a transferência." },
        { label: "Mínimo por parte no split", valor: formatCurrencyAOA(config.minimoPorParteSplit), ajuda: "Abaixo disto o pagamento segue sem split." },
        { label: "Transferência bancária", valor: config.transferenciaAtiva ? "Ativa" : "Desligada", ajuda: "Pagamento por comprovativo, validado à mão." },
      ]
    : [];

  return (
    <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Taxas da plataforma</h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
          {config
            ? `Em vigor no servidor (${config.ambiente}${config.momenuAmbienteQa ? " · Momenu em testes" : ""}). Para mudar, altera a ${config.origem}.`
            : "Valores em vigor no servidor."}
        </p>
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
    </div>
  );
}
