import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth/cookies";
import { getApiBaseUrl } from "@/lib/api/base-url";

/**
 * Descarrega um CSV do back-end com o token do cookie HttpOnly (o browser não o consegue ler).
 * Só aceita os recursos e os filtros listados aqui.
 */
const RECURSOS: Record<string, { caminho: string; filtros: string[] }> = {
  reservas: {
    caminho: "/api/Reserva/admin/exportar",
    filtros: ["estado", "tipo", "agenciaId", "clienteId", "espacoId", "pago", "de", "ate", "pesquisa", "ordem"],
  },
  pagamentos: {
    caminho: "/api/Payment/admin/exportar",
    filtros: ["estado", "metodo", "origem", "porValidar", "de", "ate", "pesquisa"],
  },
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ recurso: string }> }) {
  const { recurso } = await params;
  const alvo = RECURSOS[recurso];
  if (!alvo) return NextResponse.json({ error: "Exportação desconhecida." }, { status: 404 });

  const token = await getToken();
  if (!token) return NextResponse.json({ error: "Sessão expirada. Entra outra vez." }, { status: 401 });

  const query = new URLSearchParams();
  for (const chave of alvo.filtros) {
    const valor = request.nextUrl.searchParams.get(chave);
    if (valor) query.set(chave, valor);
  }

  const resposta = await fetch(`${getApiBaseUrl()}${alvo.caminho}?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!resposta.ok) {
    const mensagem =
      resposta.status === 401 ? "Sessão expirada. Entra outra vez." :
      resposta.status === 403 ? "Não tens permissão para exportar estes dados." :
      "Não foi possível gerar o ficheiro. Tenta outra vez.";
    return NextResponse.json({ error: mensagem }, { status: resposta.status });
  }

  return new NextResponse(resposta.body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": resposta.headers.get("content-disposition") ?? `attachment; filename="${recurso}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
