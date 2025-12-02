import { NextRequest, NextResponse } from "next/server";
import { createRoom, getQueueItem } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json();
    if (!clientId) {
      return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
    }
    const item = createRoom(clientId);
    return NextResponse.json({ roomId: item.roomId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get("roomId");
    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }
    const item = getQueueItem(roomId);
    if (!item) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

