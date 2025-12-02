import { NextRequest, NextResponse } from "next/server";
import { listShelters } from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const shelters = listShelters(type as "temporary" | "permanent" | undefined);
    // Convert checkIns Map to array for JSON serialization
    const serializedShelters = shelters.map(s => {
      const { checkIns, ...rest } = s;
      return {
        ...rest,
        checkIns: Array.from(checkIns.entries()).map(([id, data]) => ({ id, ...data })),
      };
    });
    return NextResponse.json({ shelters: serializedShelters });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

