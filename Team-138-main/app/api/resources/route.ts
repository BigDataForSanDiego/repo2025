import { NextRequest, NextResponse } from "next/server";
import { listResources } from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const resources = listResources(type as any || undefined);
    return NextResponse.json({ resources });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

