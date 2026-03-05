import AppShell from "@/components/AppShell";
import { getExpenses } from "@/lib/expense";
import type { ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import ExpensesPageClient from "./ExpensesPageClient";

export const metadata = {
  title: "Expenses",
};

const LIMIT = 3;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const categoryFilter =
    params.category && EXPENSE_CATEGORIES.includes(params.category as ExpenseCategory)
      ? (params.category as ExpenseCategory)
      : undefined;
  const dateFrom = params.dateFrom?.trim() || undefined;
  const dateTo = params.dateTo?.trim() || undefined;

  const initial = await getExpenses({
    page,
    limit: LIMIT,
    category: categoryFilter,
    dateFrom,
    dateTo,
  });

  return (
    <AppShell>
      <main className="px-4 pb-8 pt-4 sm:px-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Expenses
          </h1>
          <p className="mt-2 text-foreground/70">
            Track your expenses. Add an expense and view your list below.
          </p>
          <ExpensesPageClient
            initial={initial}
            currentPage={page}
            categoryFilter={categoryFilter ?? ""}
            dateFrom={dateFrom ?? ""}
            dateTo={dateTo ?? ""}
          />
        </div>
      </main>
    </AppShell>
  );
}
