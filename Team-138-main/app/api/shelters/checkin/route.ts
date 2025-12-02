import { NextRequest, NextResponse } from "next/server";
import { checkInShelter } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { shelterId, clientId } = await request.json();
    if (!shelterId || !clientId) {
      return NextResponse.json({ error: "Missing shelterId or clientId" }, { status: 400 });
    }
    const result = checkInShelter(shelterId, clientId);
    if (!result) {
      return NextResponse.json({ error: "Shelter not found or no availability" }, { status: 404 });
    }
    const { checkIns, ...shelterRest } = result.shelter;
    return NextResponse.json({
      checkInId: result.checkInId,
      shelter: {
        ...shelterRest,
        checkIns: Array.from(checkIns.entries()).map(([id, data]) => ({ id, ...data })),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

