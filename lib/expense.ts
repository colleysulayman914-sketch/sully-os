import { prisma } from "@/lib/db";
import type {
  Expense,
  ExpenseCategory,
  ExpenseListParams,
  ExpenseListResponse,
  ExpensePaymentMethod,
} from "@/types/expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/types/expense";

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

export async function getExpenses(
  params: ExpenseListParams = {}
): Promise<ExpenseListResponse> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const categoryFilter =
    params.category && EXPENSE_CATEGORIES.includes(params.category)
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
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses: rows.map(toExpense),
    total,
    totalPages: Math.ceil(total / limit) || 1,
    page,
    limit,
  };
}

/** Start of month (00:00:00) and end of month (23:59:59.999) in local time for given year/month. */
function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

/** Total expenses in cents for a given month (defaults to current month). */
export async function getTotalMonthlyExpenses(
  year?: number,
  month?: number
): Promise<number> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  const { start, end } = getMonthRange(y, m);
  const result = await prisma.expense.aggregate({
    where: { date: { gte: start, lte: end } },
    _sum: { amountCents: true },
  });
  return result._sum.amountCents ?? 0;
}
