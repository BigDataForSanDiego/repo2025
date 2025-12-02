import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, SESSION_COOKIE_NAME } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Adjust these field names if your backend expects different keys
    const { email, password } = body;

    // Call backend login
    const backendRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      redirect: "manual",
    });

    // If backend returns a session cookie, forward it. If it returns JSON with a token, store it.
    const setCookie = backendRes.headers.get("set-cookie");
    const data = await (async () => {
      try { return await backendRes.clone().json(); } catch { return null; }
    })();

    if (!backendRes.ok) {
      const message = data?.message || data?.error || "Invalid credentials";
      return NextResponse.json({ error: message }, { status: backendRes.status });
    }

    const res = NextResponse.json({ ok: true });

    if (setCookie) {
      // Pass-through backend cookie (session style)
      res.headers.set("Set-Cookie", setCookie);
    } else if (data?.token) {
      // Store JWT securely
      res.cookies.set(SESSION_COOKIE_NAME, data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Login failed" }, { status: 500 });
  }
}
