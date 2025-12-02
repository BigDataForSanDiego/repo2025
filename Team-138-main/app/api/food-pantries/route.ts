import { NextResponse } from "next/server";
import { listFoodPantries } from "@/lib/store";

export async function GET() {
  try {
    const pantries = listFoodPantries();
    return NextResponse.json({ pantries });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

