import { NextRequest, NextResponse } from "next/server";
import type { TriageLevel } from "@/components/TriageForm";

export async function POST(request: NextRequest) {
  try {
    const { clientId, answers } = await request.json();
    if (!clientId || !answers) {
      return NextResponse.json({ error: "Missing clientId or answers" }, { status: 400 });
    }
    
    // Simple triage logic: q1=1 → red, q2=1 → yellow, else green
    let level: TriageLevel = "green";
    if (answers.q1 === 1) {
      level = "red";
    } else if (answers.q2 === 1) {
      level = "yellow";
    }
    
    return NextResponse.json({ level, clientId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

