import { NextRequest, NextResponse } from "next/server";
import { setToken } from "@/lib/auth/cookies";
import { getApiBaseUrl } from "@/lib/api/base-url";
import type { ApiResponse } from "@/types/common.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${getApiBaseUrl()}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrUsername: body.email,
        password: body.password,
        role: "supervisor",
      }),
    });

    const data: ApiResponse<string> = await res.json();

    if (!data.isSuccess || !data.data) {
      return NextResponse.json(
        { error: data.message || data.errorMessage || "Credenciais inválidas" },
        { status: 401 },
      );
    }

    await setToken(data.data);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[login/route]", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 },
    );
  }
}
