import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const client = createClient(name, phone);
    return NextResponse.json({ clientId: client.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

