import AppShell from "@/components/AppShell";
import { getEarnings } from "@/lib/earning";
import type { EarningCategory } from "@/types/earning";
import { EARNING_CATEGORIES } from "@/types/earning";
import EarningsPageClient from "./EarningsPageClient";

export const metadata = {
  title: "Earnings",
};

const LIMIT = 10;

export default async function EarningsPage({
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
    params.category && EARNING_CATEGORIES.includes(params.category as EarningCategory)
      ? (params.category as EarningCategory)
      : undefined;
  const dateFrom = params.dateFrom?.trim() || undefined;
  const dateTo = params.dateTo?.trim() || undefined;

  const initial = await getEarnings({
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
            Earnings
          </h1>
          <p className="mt-2 text-foreground/70">
            Track your earnings. Add an earning and view your list below.
          </p>
          <EarningsPageClient
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
