"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro, semVazios } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { Paginado, PagamentoInterface, ComissaoInterface } from "@/types/payment.types";
import type {
  AlterarTaxas,
  AnunciosParceiro,
  AtividadeUsuarioAdmin,
  AuditoriaAdmin,
  AvaliacaoAdmin,
  ComboAdmin,
  CompraBilhetesAdmin,
  ConfiguracoesPlataforma,
  ConviteAdmin,
  EstadoModeracaoConta,
  EventoAdmin,
  EventoAdminDetalhe,
  FiltroAuditoriaAdmin,
  FiltroAvaliacoesAdmin,
  FiltroCatalogoAdmin,
  FiltroComprasBilhetes,
  FiltroConvitesAdmin,
  FiltroEventosAdmin,
  FiltroReservasAdmin,
  FiltroUsuariosAdmin,
  ParceiroFinanceiro,
  Reembolso,
  RegistarReembolso,
  ResultadoEscrita,
  ReservaAdminDetalhe,
  ReservaAdminLinha,
  ResumoAvaliacoesAdmin,
  ResumoReservasAdmin,
  ResumoUsuariosAdmin,
  ServicoAdmin,
  UsuarioAdmin,
} from "@/types/admin.types";

/** GET numa rota de admin que devolve `ApiResponse<T>`; os filtros vazios não vão na query. */
async function obter<T>(path: string, filtro: object = {}): Promise<ActionResult<T>> {
  try {
    const res = await serverFetch<ApiResponse<T>>(path, { params: semVazios(filtro) });
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

/** Escrita numa rota de admin (PUT/POST/DELETE com corpo JSON). */
async function enviar<T>(path: string, method: "PUT" | "POST" | "DELETE", body?: object): Promise<ResultadoEscrita<T>> {
  try {
    const res = await serverFetch<ApiResponse<T>>(path, { method, body });
    return { success: true, data: res.data, mensagem: res.message };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}

type Periodo = { de?: string; ate?: string };

/* ── Reservas ─────────────────────────────────────────────── */

export async function fetchReservasAdmin(filtro: FiltroReservasAdmin = {}) {
  return obter<Paginado<ReservaAdminLinha>>("/api/Reserva/admin", filtro);
}

export async function fetchResumoReservas(periodo: Periodo = {}) {
  return obter<ResumoReservasAdmin>("/api/Reserva/admin/resumo", periodo);
}

export async function fetchReservaAdmin(id: number) {
  return obter<ReservaAdminDetalhe>(`/api/Reserva/admin/${id}`);
}

/** Cancela com motivo (enviado ao cliente e aos parceiros). */
export async function cancelarReservaAdmin(id: number, motivo: string) {
  return enviar<ReservaAdminDetalhe>(`/api/Reserva/admin/${id}/cancelar`, "PUT", { motivo });
}

/** Regista um reembolso feito fora da plataforma. Só Admin. */
export async function registarReembolso(id: number, dados: RegistarReembolso) {
  return enviar<Reembolso>(`/api/Reserva/admin/${id}/reembolsos`, "POST", dados);
}

/* ── Utilizadores ─────────────────────────────────────────── */

export async function fetchUsuariosAdmin(filtro: FiltroUsuariosAdmin = {}) {
  return obter<Paginado<UsuarioAdmin>>("/api/Usuario/admin", filtro);
}

export async function fetchResumoUsuarios(periodo: Periodo = {}) {
  return obter<ResumoUsuariosAdmin>("/api/Usuario/admin/resumo", periodo);
}

export async function fetchAtividadeUsuario(id: number) {
  return obter<AtividadeUsuarioAdmin>(`/api/Usuario/admin/${id}/atividade`);
}

export async function bloquearConta(id: number, motivo: string) {
  return enviar<EstadoModeracaoConta>(`/api/Usuario/admin/${id}/bloquear`, "PUT", { motivo });
}

export async function desbloquearConta(id: number) {
  return enviar<EstadoModeracaoConta>(`/api/Usuario/admin/${id}/desbloquear`, "PUT");
}

/** Apaga e anonimiza (irreversível). Só Admin. */
export async function apagarConta(id: number, motivo: string) {
  return enviar<EstadoModeracaoConta>(`/api/Usuario/admin/${id}`, "DELETE", { motivo });
}

/* ── Avaliações ───────────────────────────────────────────── */

export async function fetchAvaliacoesAdmin(filtro: FiltroAvaliacoesAdmin = {}) {
  return obter<Paginado<AvaliacaoAdmin>>("/api/Avaliacao/admin", filtro);
}

export async function fetchResumoAvaliacoes(periodo: Periodo = {}) {
  return obter<ResumoAvaliacoesAdmin>("/api/Avaliacao/admin/resumo", periodo);
}

export async function ocultarAvaliacao(id: number, motivo: string) {
  return enviar<AvaliacaoAdmin>(`/api/Avaliacao/admin/${id}/ocultar`, "PUT", { motivo });
}

export async function restaurarAvaliacao(id: number) {
  return enviar<AvaliacaoAdmin>(`/api/Avaliacao/admin/${id}/restaurar`, "PUT");
}

/* ── Catálogo dos parceiros ───────────────────────────────── */

export async function fetchServicosAdmin(filtro: FiltroCatalogoAdmin = {}) {
  return obter<Paginado<ServicoAdmin>>("/api/Servico/admin", filtro);
}

export async function fetchCombosAdmin(filtro: FiltroCatalogoAdmin = {}) {
  return obter<Paginado<ComboAdmin>>("/api/Combo/admin", filtro);
}

export async function fetchEventosAdmin(filtro: FiltroEventosAdmin = {}) {
  return obter<Paginado<EventoAdmin>>("/api/Evento/admin", filtro);
}

export async function fetchEventoAdmin(id: number) {
  return obter<EventoAdminDetalhe>(`/api/Evento/admin/${id}`);
}

export async function fetchComprasBilhetes(filtro: FiltroComprasBilhetes = {}) {
  return obter<Paginado<CompraBilhetesAdmin>>("/api/Ticket/admin/compras", filtro);
}

export async function fetchAnunciosParceiro(agenciaId: number) {
  return obter<AnunciosParceiro>(`/api/Agencia/admin/${agenciaId}/anuncios`);
}

/* ── Financeiro e plataforma ──────────────────────────────── */

export interface PagamentoDetalhe {
  pagamento: PagamentoInterface;
  codigoEkwanza?: string | null;
  operationCode?: string | null;
  transacaoId?: string | null;
  referenciaExterna?: string | null;
  url?: string | null;
  reserva?: { id: number; estado: string; valorTotal: number; pago: boolean; dataInicio: string; apagada: boolean } | null;
  comissoes: ComissaoInterface[];
}

export async function fetchPagamentoDetalhe(id: number) {
  return obter<PagamentoDetalhe>(`/api/Payment/admin/${id}`);
}

export async function fetchFinanceiroParceiros(periodo: Periodo = {}) {
  return obter<ParceiroFinanceiro[]>("/api/Payment/admin/parceiros", periodo);
}

export async function fetchConvitesAdmin(filtro: FiltroConvitesAdmin = {}) {
  return obter<Paginado<ConviteAdmin>>("/api/Convite/admin", filtro);
}

export async function fetchConfiguracoesPlataforma() {
  return obter<ConfiguracoesPlataforma>("/api/Admin/configuracoes");
}

/** Só as taxas enviadas mudam; valem para os pagamentos novos. Só Admin. */
export async function alterarTaxas(dados: AlterarTaxas) {
  return enviar<ConfiguracoesPlataforma>("/api/Admin/configuracoes", "PUT", dados);
}

/* ── Auditoria ────────────────────────────────────────────── */

export async function fetchAuditoria(filtro: FiltroAuditoriaAdmin = {}) {
  return obter<Paginado<AuditoriaAdmin>>("/api/Admin/auditoria", filtro);
}

export async function fetchRecursosAuditoria() {
  return obter<string[]>("/api/Admin/auditoria/recursos");
}
