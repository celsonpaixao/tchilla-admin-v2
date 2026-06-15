"use client";
import Image from "next/image";
import { MapPin, Calendar, Users, CreditCard, CheckCircle2, XCircle, Star } from "lucide-react";
import type { ReservaInterface } from "@/types/reserva.types";
import { StatusBadge } from "@/components/global/StatusBadge";
import { GlobalUserAvatarName } from "@/components/global/GlobalAvatar";
import { formatCurrencyAOA, formatDatetime } from "@/lib/utils";

function StarRating({ value, count }: { value: number; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={11}
            fill={i < Math.round(value) ? "var(--yellow, #F59E0B)" : "none"}
            stroke={i < Math.round(value) ? "var(--yellow, #F59E0B)" : "var(--border-strong)"}
          />
        ))}
      </div>
      <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>
        {value.toFixed(1)} ({count})
      </span>
    </div>
  );
}

const SECT: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-3)",
  marginBottom: 10,
};

const DIVIDER: React.CSSProperties = {
  borderColor: "var(--border)",
  margin: "16px 0",
};

interface Props {
  reserva: ReservaInterface;
}

export function ReservaDrawerContent({ reserva: r }: Props) {
  return (
    <div>
      {/* ── Cover image ── */}
      {r.imagem && (
        <div
          style={{
            margin: "-16px -20px 16px",
            height: 160,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src={r.imagem}
            alt={r.tipoEvento}
            fill
            style={{ objectFit: "cover" }}
            sizes="480px"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(14,42,66,0.55) 0%, transparent 60%)",
            }}
          />
          {/* status badge over image */}
          <div style={{ position: "absolute", bottom: 12, left: 16 }}>
            <StatusBadge status={r.status} />
          </div>
        </div>
      )}

      {/* ── Cliente ── */}
      <p style={SECT}>Cliente</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <GlobalUserAvatarName
            name={r.cliente.nome}
            photo={r.cliente.foto}
            subtitle={r.cliente.email}
            size="md"
          />
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 20,
            background: "var(--blue-50)",
            color: "var(--blue-700)",
          }}
        >
          {r.cliente.tipo}
        </span>
      </div>
      {r.cliente.telefone && (
        <p style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 6, paddingLeft: 44 }}>
          {r.cliente.telefone}
        </p>
      )}

      <hr style={DIVIDER} />

      {/* ── Detalhes do Evento ── */}
      <p style={SECT}>Detalhes do Evento</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
        {!r.imagem && (
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 6 }}>
            <StatusBadge status={r.status} />
          </div>
        )}
        <InfoRow icon={<Calendar size={13} />} label="Início" value={formatDatetime(r.dataInicio)} />
        <InfoRow icon={<Calendar size={13} />} label="Fim" value={formatDatetime(r.dataFim)} />
        <InfoRow icon={<Users size={13} />} label="Capacidade" value={`${r.capacidade} pessoas`} />
        <InfoRow
          icon={r.pago ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          label="Pagamento"
          value={r.pago ? "Pago" : "Pendente"}
          valueColor={r.pago ? "var(--success)" : "var(--warning-fg, #B45309)"}
        />
        <InfoRow
          icon={<CreditCard size={13} />}
          label="Valor total"
          value={formatCurrencyAOA(r.precoTotal)}
          full
        />
        <InfoRow
          icon={<MapPin size={13} />}
          label="Local"
          value={r.local}
          full
        />
      </div>

      {/* ── Responsáveis ── */}
      {r.responsaveis.length > 0 && (
        <>
          <hr style={DIVIDER} />
          <p style={SECT}>Responsáveis ({r.responsaveis.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {r.responsaveis.map((resp) => (
              <div key={resp.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flexShrink: 0 }}>
                  <GlobalUserAvatarName
                    name={resp.nome}
                    photo={resp.foto}
                    subtitle={resp.tipo}
                    size="sm"
                  />
                </div>
                <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                  <StarRating value={resp.avaliacao} count={resp.quantidadeAvaliacoes} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Serviços ── */}
      {r.servicos.length > 0 && (
        <>
          <hr style={DIVIDER} />
          <p style={SECT}>Serviços</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {r.servicos.map((s) => (
              <span
                key={s.id}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "var(--blue-50)",
                  color: "var(--blue-700)",
                }}
              >
                {s.nome}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  full,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  full?: boolean;
  valueColor?: string;
}) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : {}}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
        <span style={{ color: "var(--text-3)" }}>{icon}</span>
        <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>{label}</span>
      </div>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: valueColor ?? "var(--text)", paddingLeft: 18 }}>
        {value}
      </p>
    </div>
  );
}
