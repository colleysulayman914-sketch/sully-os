import { prisma } from "@/lib/db";
import type {
  Earning,
  EarningCategory,
  EarningListParams,
  EarningListResponse,
  ExpensePaymentMethod,
} from "@/types/earning";
import { EARNING_CATEGORIES, PAYMENT_METHODS } from "@/types/earning";

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

export async function getEarnings(
  params: EarningListParams = {}
): Promise<EarningListResponse> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const categoryFilter =
    params.category && EARNING_CATEGORIES.includes(params.category)
      ? params.category
      : undefined;
  const dateFrom =
    params.dateFrom && !Number.isNaN(Date.parse(params.dateFrom))
      ? new Date(params.dateFrom)
      : undefined;
  const dateTo =
    params.dateTo && !Number.isNaN(Date.parse(params.dateTo))
      ? new Date(params.dateTo)
      : undefined;

  const where: {
    category?: string;
    date?: { gte?: Date; lte?: Date };
  } = {};
  if (categoryFilter) where.category = categoryFilter;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = dateFrom;
    if (dateTo) where.date.lte = dateTo;
  }

  const [rows, total] = await Promise.all([
    prisma.earning.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.earning.count({ where }),
  ]);

  return {
    earnings: rows.map(toEarning),
    total,
    totalPages: Math.ceil(total / limit) || 1,
    page,
    limit,
  };
}
