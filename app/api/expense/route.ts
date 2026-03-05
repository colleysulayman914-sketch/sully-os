import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type {
  Expense,
  ExpenseCategory,
  ExpenseListResponse,
  ExpensePaymentMethod,
} from "@/types/expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/types/expense";

function parseQuery(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10)
  );
  const category = searchParams.get("category") ?? "";
  const categoryFilter = EXPENSE_CATEGORIES.includes(category as ExpenseCategory)
    ? (category as ExpenseCategory)
    : undefined;
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  return { page, limit, categoryFilter, dateFrom, dateTo };
}

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
  request: Request
): Promise<NextResponse<ExpenseListResponse | { error: string }>> {
  try {
    const { page, limit, categoryFilter, dateFrom, dateTo } =
      parseQuery(request);
    const skip = (page - 1) * limit;

    const where: {
      category?: string;
      date?: { gte?: Date; lte?: Date };
    } = {};
    if (categoryFilter) where.category = categoryFilter;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom && !Number.isNaN(Date.parse(dateFrom))) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo && !Number.isNaN(Date.parse(dateTo))) {
        where.date.lte = new Date(dateTo);
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const body: ExpenseListResponse = {
      expenses: expenses.map(toExpense),
      total,
      totalPages,
      page,
      limit,
    };
    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<Expense | { error: string }>> {
  try {
    const body = await request.json();
    const amountCents =
      typeof body?.amountCents === "number"
        ? body.amountCents
        : parseInt(String(body?.amountCents ?? 0), 10);
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }
    const dateRaw = body?.date;
    if (dateRaw == null || dateRaw === "") {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }
    const date = new Date(dateRaw);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }
    const note =
      body?.note != null && typeof body.note === "string"
        ? body.note.trim() || null
        : null;
    const categoryRaw = body?.category;
    const category =
      categoryRaw != null &&
      categoryRaw !== "" &&
      EXPENSE_CATEGORIES.includes(categoryRaw as ExpenseCategory)
        ? (categoryRaw as ExpenseCategory)
        : null;
    const toWhom =
      body?.toWhom != null && typeof body.toWhom === "string"
        ? body.toWhom.trim() || null
        : null;
    const paymentMethodRaw = body?.paymentMethod;
    const paymentMethod =
      paymentMethodRaw != null &&
      paymentMethodRaw !== "" &&
      PAYMENT_METHODS.includes(paymentMethodRaw as ExpensePaymentMethod)
        ? (paymentMethodRaw as ExpensePaymentMethod)
        : null;

    const expense = await prisma.expense.create({
      data: {
        amountCents,
        date,
        note,
        category,
        toWhom,
        paymentMethod,
      },
    });
    return NextResponse.json(toExpense(expense));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
