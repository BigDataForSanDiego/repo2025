import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_BASE_URL ?? "http://localhost:8080";
const BACKEND_LOGIN = `${BACKEND}/api/v1/admin/login`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const r = await fetch(BACKEND_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    redirect: "manual",
  });

  const setCookie = r.headers.get("set-cookie");
  const data = await r.clone().json().catch(() => ({}));

  if (!r.ok) {
    return NextResponse.json({ error: data?.detail || data?.error || "Login failed" }, { status: r.status });
  }

  const out = NextResponse.json({ ok: true, user: data.user ?? null });
  if (setCookie) {
    out.headers.set("Set-Cookie", setCookie);
  } else if (data?.token) {
    out.cookies.set(process.env.SESSION_COOKIE_NAME ?? "relink_session", data.token, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 4,
    });
  }
  return out;
}
