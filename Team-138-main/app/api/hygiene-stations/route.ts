import { NextResponse } from "next/server";
import { listHygieneStations } from "@/lib/store";

export async function GET() {
  try {
    const stations = listHygieneStations();
    return NextResponse.json({ stations });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

