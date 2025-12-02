import { NextRequest, NextResponse } from "next/server";
const BASE = process.env.API_BASE_URL ?? "http://localhost:8080";
const URL = `${BASE}/api/v1/admin/change-password`;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookie = req.headers.get("cookie") ?? undefined;
  const r = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}
