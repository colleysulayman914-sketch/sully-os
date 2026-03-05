import { NextResponse } from "next/server";
import { getSavingsSummary } from "@/lib/savings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const summary = await getSavingsSummary();
    return NextResponse.json(summary);
  } catch (e) {
    console.error("GET /api/savings", e);
    return NextResponse.json(
      { error: "Failed to load savings summary" },
      { status: 500 }
    );
  }
}
