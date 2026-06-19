"use client";
import { useState, useTransition } from "react";
import NextImage from "next/image";
import {
  Search, Send, Users, User, Building2, Briefcase,
  Plus, X, Image as ImageIcon, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import type { ClientesData } from "@/types/client.types";
import type { AgenciaData } from "@/types/agencia.types";
import type { AudienceType, NotificacaoBody } from "@/types/settings.types";
import {
  notificarTodosClientes,
  notificarClienteEspecifico,
  notificarTodosParceiros,
  notificarParceiroEspecifico,
} from "@/actions/campanha.actions";
import { GlobalUserAvatarName } from "@/components/global/GlobalAvatar";
import { GlobalButton } from "@/components/global/GlobalButton";
import { GlobalSelect } from "@/components/global/GlobalSelect";
import { PageShell } from "@/components/global/PageShell";

interface CampanhasPageProps {
  clientes: ClientesData[];
  agencias: AgenciaData[];
}

const AUDIENCE_OPTIONS: Array<{
  id: AudienceType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  broadcast: boolean;
}> = [
  { id: "todos-clientes",  label: "Todos os Clientes",   sublabel: "Notifica toda a base de clientes", icon: <Users size={17} />,     broadcast: true  },
  { id: "cliente",         label: "Cliente Específico",  sublabel: "Escolha um cliente da lista",       icon: <User size={17} />,      broadcast: false },
  { id: "todos-parceiros", label: "Todos os Parceiros",  sublabel: "Notifica todos os parceiros",       icon: <Building2 size={17} />, broadcast: true  },
  { id: "parceiro",        label: "Parceiro Específico", sublabel: "Escolha um parceiro da lista",      icon: <Briefcase size={17} />, broadcast: false },
];

const inputStyle: React.CSSProperties = {
  height: "var(--control-h)",
  width: "100%",
  padding: "0 12px",
  background: "var(--surface)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--r-md)",
  fontFamily: "inherit",
  fontSize: "var(--font-ui)",
  color: "var(--text)",
  outline: "none",
  transition: "border-color .12s, box-shadow .12s",
};

const onFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "var(--blue)";
  e.target.style.boxShadow = "0 0 0 3px var(--ring)";
};
const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "var(--border-strong)";
  e.target.style.boxShadow = "none";
};

export function CampanhasPage({ clientes, agencias }: CampanhasPageProps) {
  const [audienceType, setAudienceType] = useState<AudienceType>("todos-clientes");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [search, setSearch] = useState("");

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("Geral");
  const [imagem, setImagem] = useState("");
  const [customData, setCustomData] = useState<Array<{ key: string; value: string }>>([]);

  const [isPending, startTransition] = useTransition();

  const isBroadcast = AUDIENCE_OPTIONS.find((o) => o.id === audienceType)?.broadcast ?? false;

  const filteredClientes = clientes.filter(
    (c) => !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAgencias = agencias.filter(
    (a) => !search || (a.nomeComercial ?? a.usuario.nome).toLowerCase().includes(search.toLowerCase()) || a.usuario.email.toLowerCase().includes(search.toLowerCase())
  );

  const isValid = titulo.trim() !== "" && mensagem.trim() !== "" && (isBroadcast || selectedId !== null);

  function handleAudienceChange(type: AudienceType) {
    setAudienceType(type);
    setSelectedId(null);
    setSelectedName("");
    setSearch("");
  }

  function addParam() {
    setCustomData((prev) => [...prev, { key: "", value: "" }]);
  }

  function updateParam(idx: number, field: "key" | "value", val: string) {
    setCustomData((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  }

  function removeParam(idx: number) {
    setCustomData((prev) => prev.filter((_, i) => i !== idx));
  }

  function buildBody(): NotificacaoBody {
    const data: Record<string, string> = {};
    customData.forEach(({ key, value }) => { if (key.trim()) data[key.trim()] = value; });
    return {
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      tipo: tipo.trim() || "Geral",
      ...(imagem.trim() ? { imagem: imagem.trim() } : {}),
      ...(Object.keys(data).length > 0 ? { data } : {}),
    };
  }

  function handleEnviar() {
    if (!isValid) return;
    const body = buildBody();
    startTransition(async () => {
      let result;
      if      (audienceType === "todos-clientes")             result = await notificarTodosClientes(body);
      else if (audienceType === "cliente"   && selectedId)    result = await notificarClienteEspecifico(selectedId, body);
      else if (audienceType === "todos-parceiros")            result = await notificarTodosParceiros(body);
      else if (audienceType === "parceiro"  && selectedId)    result = await notificarParceiroEspecifico(selectedId, body);
      else return;

      if (result.success) {
        const target =
          audienceType === "todos-clientes"  ? "todos os clientes" :
          audienceType === "todos-parceiros" ? "todos os parceiros" : selectedName;
        toast.success(`Campanha enviada para ${target}!`);
        setTitulo(""); setMensagem(""); setTipo("Geral");
        setImagem(""); setCustomData([]);
        setSelectedId(null); setSelectedName("");
      } else {
        toast.error(result.error ?? "Erro ao enviar campanha.");
      }
    });
  }

  const activeOpt = AUDIENCE_OPTIONS.find((o) => o.id === audienceType);

  return (
    <PageShell title="Campanhas Push" subtitle="Envie notificações push segmentadas">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Coluna esquerda: audiência ── */}
        <div className="space-y-4">
          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>1. Selecionar Audiência</h2>

            <div className="grid grid-cols-2 gap-2">
              {AUDIENCE_OPTIONS.map((opt) => {
                const active = audienceType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAudienceChange(opt.id)}
                    className="flex flex-col items-start gap-1.5 p-3 rounded-xl text-left cursor-pointer"
                    style={{
                      border: `1.5px solid ${active ? "var(--blue)" : "var(--border)"}`,
                      background: active ? "var(--blue-50)" : "var(--gray-25)",
                      transition: "border-color .12s, background .12s",
                    }}
                  >
                    <span style={{ color: active ? "var(--blue-700)" : "var(--text-3)" }}>{opt.icon}</span>
                    <span className="text-xs font-semibold leading-tight" style={{ color: active ? "var(--blue-700)" : "var(--text)" }}>
                      {opt.label}
                    </span>
                    <span className="text-xs leading-tight" style={{ color: "var(--text-3)" }}>{opt.sublabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de selecção individual */}
          {!isBroadcast && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-3)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={audienceType === "cliente" ? "Buscar cliente…" : "Buscar parceiro…"}
                  style={{ ...inputStyle, paddingLeft: 32 }}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div className="space-y-0.5 max-h-52 overflow-y-auto">
                {audienceType === "cliente"
                  ? filteredClientes.slice(0, 40).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedId(c.id); setSelectedName(c.nome); }}
                        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer text-left"
                        style={{
                          background: selectedId === c.id ? "var(--blue-50)" : "transparent",
                          border: selectedId === c.id ? "1px solid var(--blue-100)" : "1px solid transparent",
                        }}
                      >
                        <GlobalUserAvatarName name={c.nome} photo={c.foto} subtitle={c.email} />
                      </button>
                    ))
                  : filteredAgencias.slice(0, 40).map((a) => {
                      const name = a.nomeComercial ?? a.usuario.nome;
                      const uid = a.usuario.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => { setSelectedId(uid); setSelectedName(name); }}
                          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer text-left"
                          style={{
                            background: selectedId === uid ? "var(--blue-50)" : "transparent",
                            border: selectedId === uid ? "1px solid var(--blue-100)" : "1px solid transparent",
                          }}
                        >
                          <GlobalUserAvatarName name={name} photo={a.usuario.foto} subtitle={a.usuario.email} />
                        </button>
                      );
                    })
                }
                {audienceType === "cliente"  && filteredClientes.length  === 0 && <p className="text-xs text-center py-4" style={{ color: "var(--text-3)" }}>Nenhum cliente encontrado</p>}
                {audienceType === "parceiro" && filteredAgencias.length === 0 && <p className="text-xs text-center py-4" style={{ color: "var(--text-3)" }}>Nenhum parceiro encontrado</p>}
              </div>
            </div>
          )}
        </div>

        {/* ── Coluna direita: composição ── */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>2. Compor Mensagem</h2>

          {/* Resumo do alvo */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "var(--blue-50)", border: "1px solid var(--blue-100)" }}
          >
            <span style={{ color: "var(--blue-700)" }}>{activeOpt?.icon}</span>
            <p className="text-xs" style={{ color: "var(--blue-700)" }}>
              {isBroadcast
                ? activeOpt?.label
                : selectedName
                  ? <strong>{selectedName}</strong>
                  : <span style={{ opacity: 0.65 }}>Selecione um destinatário à esquerda</span>
              }
            </p>
          </div>

          {/* Título */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="flex items-center justify-between">
              <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>
                Título <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{titulo.length}/60</span>
            </div>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value.slice(0, 60))}
              placeholder="Ex: Promoção especial para você!"
              style={inputStyle}
              onFocus={onFocusInput}
              onBlur={onBlurInput}
            />
          </div>

          {/* Mensagem */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="flex items-center justify-between">
              <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>
                Mensagem <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{mensagem.length}/200</span>
            </div>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value.slice(0, 200))}
              placeholder="Confira nossas ofertas exclusivas com até 30% de desconto!"
              rows={3}
              style={{
                width: "100%", padding: "8px 12px",
                background: "var(--surface)", color: "var(--text)",
                border: "1px solid var(--border-strong)", borderRadius: "var(--r-md)",
                fontFamily: "inherit", fontSize: "var(--font-ui)",
                outline: "none", resize: "none", transition: "border-color .12s, box-shadow .12s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--blue)"; e.target.style.boxShadow = "0 0 0 3px var(--ring)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-strong)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Tipo + Imagem */}
          <div className="grid grid-cols-2 gap-3">
            <GlobalSelect
              id="camp-tipo"
              label="Tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="Geral">Geral</option>
              <option value="Promo">Promo</option>
              <option value="Alert">Alert</option>
              <option value="Cupom">Cupom</option>
            </GlobalSelect>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)", display: "flex", gap: 6, alignItems: "center" }}>
                URL da Imagem
                <span style={{ fontWeight: 400, color: "var(--text-3)", fontSize: 11.5 }}>opcional</span>
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <ImageIcon size={13} style={{ position: "absolute", left: 11, color: "var(--text-3)", pointerEvents: "none" }} />
                <input
                  value={imagem}
                  onChange={(e) => setImagem(e.target.value)}
                  placeholder="https://…"
                  style={{ ...inputStyle, paddingLeft: 30 }}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>
            </div>
          </div>

          {/* Parâmetros customizados */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="flex items-center justify-between">
              <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <SlidersHorizontal size={12} />
                Parâmetros adicionais
                <span style={{ fontWeight: 400, color: "var(--text-3)", fontSize: 11.5 }}>opcional</span>
              </label>
              <button
                onClick={addParam}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}
              >
                <Plus size={11} /> Personalizado
              </button>
            </div>

            {/* Sugestões pré-definidas */}
            <div className="flex flex-wrap gap-1.5">
              {(["service", "espace", "combo", "cupom"] as const).map((key) => {
                const used = customData.some((p) => p.key === key);
                return (
                  <button
                    key={key}
                    onClick={() => !used && setCustomData((prev) => [...prev, { key, value: "" }])}
                    disabled={used}
                    className="text-xs px-2.5 py-1 rounded-full font-mono cursor-pointer transition-all"
                    style={{
                      border: `1px solid ${used ? "var(--border)" : "var(--border-strong)"}`,
                      background: used ? "var(--gray-50)" : "var(--surface)",
                      color: used ? "var(--text-3)" : "var(--text-2)",
                      opacity: used ? 0.5 : 1,
                      cursor: used ? "default" : "pointer",
                      textDecoration: used ? "line-through" : "none",
                    }}
                  >
                    {used ? "✓ " : "+ "}{key}
                  </button>
                );
              })}
            </div>

            {customData.length > 0 && (
              <div className="space-y-2">
                {customData.map((param, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={param.key}
                      onChange={(e) => updateParam(idx, "key", e.target.value)}
                      placeholder="chave"
                      style={{ ...inputStyle, flex: "0 0 38%", fontFamily: "monospace", fontSize: 12 } as React.CSSProperties}
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                    <input
                      value={param.value}
                      onChange={(e) => updateParam(idx, "value", e.target.value)}
                      placeholder="valor"
                      style={{ ...inputStyle, flex: 1 }}
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                    <button
                      onClick={() => removeParam(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 cursor-pointer"
                      style={{ color: "var(--danger-fg)" }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Preview da notificação ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>
              Pré-visualização
            </label>

            {/* Ecrã do telemóvel */}
            <div
              style={{
                borderRadius: "var(--r-md)",
                background: "linear-gradient(145deg, #1a2744 0%, #0e1b36 100%)",
                padding: "16px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {/* Barra de status */}
              <div className="flex items-center justify-between px-1" style={{ opacity: 0.5 }}>
                <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>9:41</span>
                <div className="flex items-center gap-1">
                  {[4, 3, 2].map((h) => (
                    <div key={h} style={{ width: 3, height: h * 2 + 2, background: "#fff", borderRadius: 1 }} />
                  ))}
                  <div style={{ width: 14, height: 7, border: "1.5px solid #fff", borderRadius: 2, marginLeft: 3, position: "relative" }}>
                    <div style={{ position: "absolute", left: 1, top: 1, bottom: 1, right: 3, background: "#fff", borderRadius: 1 }} />
                  </div>
                </div>
              </div>

              {/* Card da notificação */}
              <div
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {/* Cabeçalho: ícone + app + tempo */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    style={{
                      width: 18, height: 18,
                      borderRadius: 5,
                      background: "linear-gradient(135deg, #14aae9 0%, #0e7fc2 100%)",
                      display: "grid", placeItems: "center", flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    <NextImage
                      src="/assets/tchilla-simbolo-branco.png"
                      alt="Tchilla"
                      width={12}
                      height={12}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.75)", flex: 1, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Tchilla
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>agora</span>
                </div>

                {/* Corpo: título + mensagem + thumb */}
                <div className="flex items-start gap-2">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: titulo ? "#fff" : "rgba(255,255,255,0.3)",
                        lineHeight: 1.3,
                        marginBottom: 2,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                      } as React.CSSProperties}
                    >
                      {titulo || "Título da notificação"}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: mensagem ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      } as React.CSSProperties}
                    >
                      {mensagem || "Texto da mensagem aparece aqui…"}
                    </p>
                  </div>

                  {/* Thumbnail */}
                  {imagem ? (
                    <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagem}
                        alt="preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px dashed rgba(255,255,255,0.2)",
                        display: "grid", placeItems: "center",
                      }}
                    >
                      <ImageIcon size={14} style={{ color: "rgba(255,255,255,0.25)" }} />
                    </div>
                  )}
                </div>

                {/* Imagem expandida (quando preenchida) */}
                {imagem && (
                  <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden", height: 80 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagem}
                      alt="banner"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>

              {/* Hint */}
              <p className="text-center" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                Pré-visualização aproximada
              </p>
            </div>
          </div>

          <GlobalButton
            onClick={handleEnviar}
            loading={isPending}
            disabled={!isValid}
            fullWidth
            rightIcon={<Send size={14} />}
          >
            Enviar Campanha
          </GlobalButton>
        </div>
      </div>
    </PageShell>
  );
}
