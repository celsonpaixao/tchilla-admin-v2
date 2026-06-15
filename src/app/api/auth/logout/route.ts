import { NextResponse } from "next/server";
import { clearToken, getToken } from "@/lib/auth/cookies";

export async function POST() {
  try {
    const token = await getToken();

    // Notifica a API .NET
    if (token) {
      await fetch(`${process.env.API_URL}/api/Auth/logout`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}); // Não bloqueia mesmo se falhar
    }

    await clearToken();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[logout/route]", err);
    await clearToken();
    return NextResponse.json({ success: true });
  }
}
