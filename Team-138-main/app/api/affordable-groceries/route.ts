import { NextResponse } from "next/server";
import { listAffordableGroceries } from "@/lib/store";

export async function GET() {
  try {
    const groceries = listAffordableGroceries();
    return NextResponse.json({ groceries });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


