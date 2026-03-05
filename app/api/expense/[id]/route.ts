import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Expense, ExpenseCategory, ExpensePaymentMethod } from "@/types/expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/types/expense";

type RouteParams = { params: Promise<{ id: string }> };

function toExpense(row: {
  id: string;
  amountCents: number;
  date: Date;
  note: string | null;
  category: string | null;
  toWhom: string | null;
  paymentMethod: string | null;
  createdAt: Date;
}): Expense {
  const category =
    row.category && EXPENSE_CATEGORIES.includes(row.category as ExpenseCategory)
      ? (row.category as ExpenseCategory)
      : null;
  const paymentMethod =
    row.paymentMethod && PAYMENT_METHODS.includes(row.paymentMethod as ExpensePaymentMethod)
      ? (row.paymentMethod as ExpensePaymentMethod)
      : null;
  return {
    id: row.id,
    amountCents: row.amountCents,
    date: row.date,
    note: row.note,
    category,
    toWhom: row.toWhom,
    paymentMethod,
    createdAt: row.createdAt,
  };
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<Expense | { error: string }>> {
  try {
    const { id } = await params;
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(toExpense(expense));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<Expense | { error: string }>> {
  try {
    const { id } = await params;
    const body = await request.json();

    let amountCents: number | undefined = undefined;
    if (body?.amountCents !== undefined) {
      const n =
        typeof body.amountCents === "number"
          ? body.amountCents
          : parseInt(String(body.amountCents), 10);
      if (!Number.isInteger(n) || n <= 0) {
        return NextResponse.json(
          { error: "Amount must be a positive integer" },
          { status: 400 }
        );
      }
      amountCents = n;
    }

    let date: Date | undefined = undefined;
    if (body?.date !== undefined) {
      if (body.date === null || body.date === "") {
        return NextResponse.json(
          { error: "Date is required" },
          { status: 400 }
        );
      }
      const d = new Date(body.date);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "Invalid date" },
          { status: 400 }
        );
      }
      date = d;
    }

    const note =
      body?.note !== undefined
        ? typeof body.note === "string"
          ? body.note.trim() || null
          : null
        : undefined;

    let category: string | null | undefined = undefined;
    if (body?.category !== undefined) {
      if (body.category === null || body.category === "") {
        category = null;
      } else if (
        EXPENSE_CATEGORIES.includes(body.category as ExpenseCategory)
      ) {
        category = body.category;
      }
    }

    const toWhom =
      body?.toWhom !== undefined
        ? typeof body.toWhom === "string"
          ? body.toWhom.trim() || null
          : null
        : undefined;

    let paymentMethod: string | null | undefined = undefined;
    if (body?.paymentMethod !== undefined) {
      if (body.paymentMethod === null || body.paymentMethod === "") {
        paymentMethod = null;
      } else if (
        PAYMENT_METHODS.includes(body.paymentMethod as ExpensePaymentMethod)
      ) {
        paymentMethod = body.paymentMethod;
      }
    }

    const data: {
      amountCents?: number;
      date?: Date;
      note?: string | null;
      category?: string | null;
      toWhom?: string | null;
      paymentMethod?: string | null;
    } = {};
    if (amountCents !== undefined) data.amountCents = amountCents;
    if (date !== undefined) data.date = date;
    if (note !== undefined) data.note = note;
    if (category !== undefined) data.category = category;
    if (toWhom !== undefined) data.toWhom = toWhom;
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;

    if (Object.keys(data).length === 0) {
      const existing = await prisma.expense.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(toExpense(existing));
    }

    const expense = await prisma.expense.update({
      where: { id },
      data,
    });
    return NextResponse.json(toExpense(expense));
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<{ success: true } | { error: string }>> {
  try {
    const { id } = await params;
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
