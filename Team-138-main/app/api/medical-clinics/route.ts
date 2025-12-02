import { NextRequest, NextResponse } from "next/server";
import { listMedicalClinics } from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const clinics = listMedicalClinics();
    const filtered = type && type !== "all" 
      ? clinics.filter(c => c.type === type)
      : clinics;
    return NextResponse.json({ clinics: filtered });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

