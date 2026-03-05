import { NextResponse } from "next/server";
import { setSavingsGoal, removeSavingsGoal } from "@/lib/savings";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : undefined;
    const targetAmountCents =
      typeof body.targetAmountCents === "number" ? body.targetAmountCents : undefined;

    if (!category) {
      return NextResponse.json(
        { error: "Valid category required" },
        { status: 400 }
      );
    }

    if (targetAmountCents === undefined || targetAmountCents < 0) {
      return NextResponse.json(
        { error: "targetAmountCents must be a non-negative number" },
        { status: 400 }
      );
    }

    if (targetAmountCents === 0) {
      await removeSavingsGoal(category);
      return NextResponse.json({ success: true });
    }

    await setSavingsGoal(category, targetAmountCents);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PATCH /api/savings/goal", e);
    return NextResponse.json(
      { error: "Failed to set savings goal" },
      { status: 500 }
    );
  }
}
