import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL ?? "http://localhost:8080";
const POST_URL = `${BASE}/api/v1/admin/participants`;
const GET_URL  = `${BASE}/api/v1/admin/participants`;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pass-through list (your backend GET now exists)
export async function GET() {
  try {
    const r = await fetch(GET_URL, { headers: { "Content-Type": "application/json" }, cache: "no-store" });
    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Proxy error (participants GET)" }, { status: 500 });
  }
}

// Create participant with strict payload + better error reporting
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // normalize client payload
    const payload = {
      org_id: Number(body.org_id),
      display_name: String(body.display_name ?? "").trim(),
      phone: String(body.phone ?? "").trim(),
      email: String(body.email ?? "").trim(),
      preferred_contact: String(body.preferred_contact ?? "").toUpperCase(), // "EMAIL" | "SMS"
    };

    // quick guards (avoid sending bad enum/empty values to backend)
    if (!payload.org_id || !payload.display_name || !payload.phone || !payload.email || !["EMAIL","SMS"].includes(payload.preferred_contact)) {
      return NextResponse.json({ error: "Missing/invalid fields" }, { status: 400 });
    }

    const cookie = req.headers.get("cookie") ?? undefined;
    const r = await fetch(POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(payload),
    });

    // try to parse backend response
    const text = await r.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!r.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || data?.message || "Backend error creating participant", backend: data },
        { status: r.status }
      );
    }
    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Proxy error (participants POST)" }, { status: 500 });
  }
}
