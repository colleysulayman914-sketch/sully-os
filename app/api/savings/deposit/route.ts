import { NextResponse } from "next/server";
import { createSavingsDeposit } from "@/lib/savings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amountCents =
      typeof body.amountCents === "number" ? body.amountCents : undefined;
    const dateStr =
      typeof body.date === "string" && body.date.trim()
        ? body.date.trim()
        : undefined;
    const category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : undefined;
    const note =
      body.note !== undefined && body.note !== null
        ? String(body.note).trim() || null
        : null;

    if (
      amountCents === undefined ||
      amountCents < 1 ||
      !dateStr ||
      !category
    ) {
      return NextResponse.json(
        { error: "Invalid input: amount (positive), date, and category required" },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    await createSavingsDeposit({
      amountCents,
      date,
      note,
      category,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /api/savings/deposit", e);
    return NextResponse.json(
      { error: "Failed to add savings deposit" },
      { status: 500 }
    );
  }
}
