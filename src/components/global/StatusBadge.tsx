import { cn } from "@/lib/utils";
import type { ReservaStatus } from "@/types/reserva.types";
import type { PagamentoStatus } from "@/types/payment.types";

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  Pendente: {
    background: "var(--warning-bg)",
    color: "var(--warning-fg)",
    border: "1px solid var(--warning-bd)",
  },
  Confirmado: {
    background: "var(--info-bg)",
    color: "var(--info-fg)",
    border: "1px solid var(--info-bd)",
  },
  Cancelado: {
    background: "var(--danger-bg)",
    color: "var(--danger-fg)",
    border: "1px solid var(--danger-bd)",
  },
  Concluido: {
    background: "var(--success-bg)",
    color: "var(--success-fg)",
    border: "1px solid var(--success-bd)",
  },
};

const STATUS_LABELS: Record<string, string> = {
  Pendente: "Pendente",
  Confirmado: "Confirmado",
  Cancelado: "Cancelado",
  Concluido: "Concluído",
};

interface StatusBadgeProps {
  status: ReservaStatus | PagamentoStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? {
    background: "var(--gray-100)",
    color: "var(--text-2)",
    border: "1px solid var(--border)",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        className
      )}
      style={style}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "currentColor", opacity: 0.7 }}
      />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
