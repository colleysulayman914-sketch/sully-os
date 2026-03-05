import { connection } from "next/server";
import AppShell from "@/components/AppShell";
import { getTotalMonthlyEarnings } from "@/lib/earning";
import { getTotalMonthlyExpenses } from "@/lib/expense";
import { getSavingsSummary, getTotalMonthlySavings } from "@/lib/savings";
import { ArrowDownCircle, ArrowUpCircle, PiggyBank } from "lucide-react";

function formatGMD(cents: number): string {
  return new Intl.NumberFormat("en-GM", {
    style: "currency",
    currency: "GMD",
  }).format(cents / 100);
}

export default async function Home() {
  await connection();
  const [totalEarnings, totalExpenses, totalSavingsThisMonth, savingsSummary] =
    await Promise.all([
      getTotalMonthlyEarnings(),
      getTotalMonthlyExpenses(),
      getTotalMonthlySavings(),
      getSavingsSummary(),
    ]);

  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  /** Total outgoing = expenses + savings done this month (savings count as outgoings). */
  const totalOutgoing = totalExpenses + totalSavingsThisMonth;
  const netCents = totalEarnings - totalOutgoing;

  return (
    <AppShell>
      <main className="px-4 pb-8 pt-4 sm:px-6 overflow-x-hidden">
        <div className="mx-auto max-w-3xl min-w-0">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight sm:block hidden">
            Overview
          </h1>
          <p className="mt-2 text-foreground/70 sm:block hidden">
            Track your expenses, view transactions, and manage your budget.
          </p>

          {/* Hero balance card (mobile-first) */}
          <section className="mt-6 min-w-0" aria-label={`Net balance for ${monthLabel}`}>
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-foreground p-5 text-background shadow-sm sm:p-6">
              <span className="text-sm font-medium text-background/80">Net this month</span>
              <p className="text-2xl font-semibold tabular-nums sm:text-3xl">
                {formatGMD(netCents)}
              </p>
              <p className="text-xs text-background/70">{monthLabel}</p>
            </div>
          </section>

          {/* Summary row: Income + Expenses */}
          <section
            className="mt-4 grid min-w-0 grid-cols-2 gap-3 sm:mt-6 sm:gap-4"
            aria-label={`Monthly totals for ${monthLabel}`}
          >
            <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-background p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ArrowUpCircle className="size-5 shrink-0" aria-hidden />
                <span className="text-sm font-medium">Income</span>
              </div>
              <p className="text-lg font-semibold text-foreground tabular-nums sm:text-xl">
                {formatGMD(totalEarnings)}
              </p>
              <p className="text-xs text-muted-foreground">{monthLabel}</p>
            </div>
            <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-background p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <ArrowDownCircle className="size-5 shrink-0" aria-hidden />
                <span className="text-sm font-medium">Expenses</span>
              </div>
              <p className="text-lg font-semibold text-foreground tabular-nums sm:text-xl">
                {formatGMD(totalOutgoing)}
              </p>
              <p className="text-xs text-muted-foreground">
                {monthLabel}
                {totalSavingsThisMonth > 0 && " (incl. savings)"}
              </p>
            </div>
          </section>

          {savingsSummary.categories.length > 0 && (
            <section
              className="mt-6 min-w-0"
              aria-label="Savings by category"
            >
              <div className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-background p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <PiggyBank className="size-5 shrink-0" aria-hidden />
                  <span className="text-sm font-medium">Savings</span>
                </div>
                <ul className="flex flex-col gap-3 min-w-0">
                  {savingsSummary.categories.map((cat) => (
                    <li
                      key={cat.category}
                      className="flex min-w-0 flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <span className="text-sm font-medium text-foreground truncate">
                        {cat.category}
                      </span>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-base font-semibold text-foreground tabular-nums">
                          {formatGMD(cat.totalCents)}
                        </span>
                        {cat.goalCents != null && (
                          <span className="text-xs text-muted-foreground">
                            Goal: {formatGMD(cat.goalCents)}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      </main>
    </AppShell>
  );
}
