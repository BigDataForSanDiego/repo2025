import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL ?? "http://localhost:8080";
const POST_URL = `${BASE}/api/v1/admin/admins`;
const GET_URL = `${BASE}/api/v1/admin/admins`;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const r = await fetch(GET_URL, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: r.status });
  } catch (err) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookie = req.headers.get("cookie") ?? undefined;

  const r = await fetch(POST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return NextResponse.json(
      { error: data?.detail || data?.error || "Failed to create admin" },
      { status: r.status }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
