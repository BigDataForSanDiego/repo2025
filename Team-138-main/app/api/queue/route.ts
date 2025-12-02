import { NextResponse } from "next/server";
import { listQueue, getClient } from "@/lib/store";

export async function GET() {
  try {
    const queue = listQueue();
    const clients: Record<string, ReturnType<typeof getClient>> = {};
    queue.forEach(item => {
      const client = getClient(item.clientId);
      if (client) {
        clients[item.clientId] = client;
      }
    });
    return NextResponse.json({ queue, clients });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

