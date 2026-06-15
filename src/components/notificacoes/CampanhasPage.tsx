"use client";
import { useState, useTransition } from "react";
import { Search, Send, Bell } from "lucide-react";
import { toast } from "sonner";
import type { ClientesData } from "@/types/client.types";
import { enviarCampanha } from "@/actions/campanha.actions";
import { GlobalUserAvatarName } from "@/components/global/GlobalAvatar";
import { GlobalButton } from "@/components/global/GlobalButton";

interface CampanhasPageProps {
  clientes: ClientesData[];
}

export function CampanhasPage({ clientes }: CampanhasPageProps) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<ClientesData | null>(null);
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = search
    ? clientes.filter((c) =>
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      )
    : clientes;

  function handleEnviar() {
    if (!selectedUser || !titulo || !mensagem) return;
    startTransition(async () => {
      const result = await enviarCampanha({
        userId: selectedUser.id,
        titulo,
        mensagem,
        tipo: "Geral",
      });
      if (result.success) {
        toast.success(`Campanha enviada para ${selectedUser.nome}!`);
        setTitulo(""); setMensagem(""); setSelectedUser(null);
      } else {
        toast.error(result.error ?? "Erro ao enviar campanha.");
      }
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Campanhas Push</h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Envie notificações push para usuários específicos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seleção de usuário */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            1. Selecionar Destinatário
          </h2>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente…"
              className="w-full pl-8 pr-3.5 py-2 text-sm rounded-lg border outline-none transition-colors"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
            {filtered.slice(0, 30).map((cliente) => (
              <button
                key={cliente.id}
                onClick={() => setSelectedUser(cliente)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-left"
                style={{
                  background: selectedUser?.id === cliente.id ? "var(--blue-50)" : "transparent",
                  border: selectedUser?.id === cliente.id ? "1px solid var(--blue-100)" : "1px solid transparent",
                }}
              >
                <GlobalUserAvatarName name={cliente.nome} photo={cliente.foto} subtitle={cliente.email} />
              </button>
            ))}
          </div>
        </div>

        {/* Composição da campanha */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            2. Compor Mensagem
          </h2>

          {selectedUser && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "var(--blue-50)", border: "1px solid var(--blue-100)" }}
            >
              <Bell size={13} style={{ color: "var(--blue-700)" }} />
              <p className="text-xs" style={{ color: "var(--blue-700)" }}>
                Enviando para: <strong>{selectedUser.nome}</strong>
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Título</label>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>{titulo.length}/60</span>
            </div>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value.slice(0, 60))}
              placeholder="Ex: Promoção especial para você!"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border outline-none transition-all"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Mensagem</label>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>{mensagem.length}/200</span>
            </div>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value.slice(0, 200))}
              placeholder="Ex: Confira nossas ofertas exclusivas com até 30% de desconto!"
              rows={4}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border outline-none resize-none transition-all"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <GlobalButton
            onClick={handleEnviar}
            loading={isPending}
            disabled={!selectedUser || !titulo || !mensagem}
            fullWidth
            rightIcon={<Send size={14} />}
          >
            Enviar Campanha
          </GlobalButton>
        </div>
      </div>
    </div>
  );
}
