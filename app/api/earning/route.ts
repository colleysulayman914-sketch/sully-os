import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type {
  Earning,
  EarningCategory,
  EarningListResponse,
  ExpensePaymentMethod,
} from "@/types/earning";
import { EARNING_CATEGORIES, PAYMENT_METHODS } from "@/types/earning";

function parseQuery(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10)
  );
  const category = searchParams.get("category") ?? "";
  const categoryFilter = EARNING_CATEGORIES.includes(category as EarningCategory)
    ? (category as EarningCategory)
    : undefined;
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  return { page, limit, categoryFilter, dateFrom, dateTo };
}

function toEarning(row: {
  id: string;
  amountCents: number;
  date: Date;
  note: string | null;
  category: string | null;
  fromWhom: string | null;
  paymentMethod: string | null;
  createdAt: Date;
}): Earning {
  const category =
    row.category && EARNING_CATEGORIES.includes(row.category as EarningCategory)
      ? (row.category as EarningCategory)
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
    fromWhom: row.fromWhom,
    paymentMethod,
    createdAt: row.createdAt,
  };
}

export async function GET(
  request: Request
): Promise<NextResponse<EarningListResponse | { error: string }>> {
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

    const [earnings, total] = await Promise.all([
      prisma.earning.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.earning.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const body: EarningListResponse = {
      earnings: earnings.map(toEarning),
      total,
      totalPages,
      page,
      limit,
    };
    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<Earning | { error: string }>> {
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
      EARNING_CATEGORIES.includes(categoryRaw as EarningCategory)
        ? (categoryRaw as EarningCategory)
        : null;
    const fromWhom =
      body?.fromWhom != null && typeof body.fromWhom === "string"
        ? body.fromWhom.trim() || null
        : null;
    const paymentMethodRaw = body?.paymentMethod;
    const paymentMethod =
      paymentMethodRaw != null &&
      paymentMethodRaw !== "" &&
      PAYMENT_METHODS.includes(paymentMethodRaw as ExpensePaymentMethod)
        ? (paymentMethodRaw as ExpensePaymentMethod)
        : null;

    const earning = await prisma.earning.create({
      data: {
        amountCents,
        date,
        note,
        category,
        fromWhom,
        paymentMethod,
      },
    });
    return NextResponse.json(toEarning(earning));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create earning" },
      { status: 500 }
    );
  }
}
