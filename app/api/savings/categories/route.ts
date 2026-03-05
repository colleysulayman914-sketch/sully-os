import { NextResponse } from "next/server";
import {
  getSavingsCategoryNames,
  createSavingsCategory,
} from "@/lib/savings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const names = await getSavingsCategoryNames();
    return NextResponse.json({ categories: names });
  } catch (e) {
    console.error("GET /api/savings/categories", e);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : undefined;
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    await createSavingsCategory(name);
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to add category";
    const status =
      message === "Category already exists" ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
