"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro, semVazios } from "@/lib/api/erros";
import type { ActionResult, ApiResponse } from "@/types/common.types";
import type { Paginado, PagamentoInterface, ComissaoInterface } from "@/types/payment.types";
import type {
  AnunciosParceiro,
  AtividadeUsuarioAdmin,
  AvaliacaoAdmin,
  ComboAdmin,
  CompraBilhetesAdmin,
  ConfiguracoesPlataforma,
  ConviteAdmin,
  EventoAdmin,
  EventoAdminDetalhe,
  FiltroAvaliacoesAdmin,
  FiltroCatalogoAdmin,
  FiltroComprasBilhetes,
  FiltroConvitesAdmin,
  FiltroEventosAdmin,
  FiltroReservasAdmin,
  FiltroUsuariosAdmin,
  ParceiroFinanceiro,
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

/* ── Avaliações ───────────────────────────────────────────── */

export async function fetchAvaliacoesAdmin(filtro: FiltroAvaliacoesAdmin = {}) {
  return obter<Paginado<AvaliacaoAdmin>>("/api/Avaliacao/admin", filtro);
}

export async function fetchResumoAvaliacoes(periodo: Periodo = {}) {
  return obter<ResumoAvaliacoesAdmin>("/api/Avaliacao/admin/resumo", periodo);
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
