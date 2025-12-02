import { NextRequest, NextResponse } from "next/server";
import { claimRoom } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { roomId, staffId } = await request.json();
    if (!roomId || !staffId) {
      return NextResponse.json({ error: "Missing roomId or staffId" }, { status: 400 });
    }
    const item = claimRoom(roomId, staffId);
    if (!item) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, item });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

