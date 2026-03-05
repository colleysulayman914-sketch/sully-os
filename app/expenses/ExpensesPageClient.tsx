"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExpenseListResponse, ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseTable from "./ExpenseTable";
import WheelPagination from "@/components/ui/wheel-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ExpensesPageClientProps = {
  initial: ExpenseListResponse;
  currentPage: number;
  categoryFilter: "" | ExpenseCategory;
  dateFrom: string;
  dateTo: string;
};

function buildExpensesUrl(params: {
  page?: number;
  category?: "" | ExpenseCategory;
  dateFrom?: string;
  dateTo?: string;
}) {
  const q = new URLSearchParams();
  if (params.page != null && params.page > 1) q.set("page", String(params.page));
  if (params.category) q.set("category", params.category);
  if (params.dateFrom) q.set("dateFrom", params.dateFrom);
  if (params.dateTo) q.set("dateTo", params.dateTo);
  const s = q.toString();
  return s ? `/expenses?${s}` : "/expenses";
}

export default function ExpensesPageClient({
  initial,
  currentPage,
  categoryFilter,
  dateFrom,
  dateTo,
}: ExpensesPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAdded = () => {
    setAddModalOpen(false);
    startTransition(() => router.refresh());
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      router.push(
        buildExpensesUrl({
          page: newPage + 1,
          category: categoryFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
      );
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as "" | ExpenseCategory;
    startTransition(() => {
      router.push(
        buildExpensesUrl({
          page: 1,
          category: v || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
      );
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    startTransition(() => {
      router.push(
        buildExpensesUrl({
          page: 1,
          category: categoryFilter || undefined,
          dateFrom: v || undefined,
          dateTo: dateTo || undefined,
        })
      );
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    startTransition(() => {
      router.push(
        buildExpensesUrl({
          page: 1,
          category: categoryFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: v || undefined,
        })
      );
    });
  };

  return (
    <div className="mt-6 flex min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <label htmlFor="expense-filter-category" className="sr-only">
            Filter by category
          </label>
          <select
            id="expense-filter-category"
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="min-h-[44px] w-full rounded-md border border-input bg-background px-4 py-2 text-foreground sm:w-auto sm:min-w-[180px]"
          >
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label htmlFor="expense-filter-dateFrom" className="sr-only">
            From date
          </label>
          <input
            id="expense-filter-dateFrom"
            type="date"
            value={dateFrom}
            onChange={handleDateFromChange}
            className="min-h-[44px] w-full rounded-md border border-input bg-background px-4 py-2 text-foreground sm:w-auto"
          />
          <label htmlFor="expense-filter-dateTo" className="sr-only">
            To date
          </label>
          <input
            id="expense-filter-dateTo"
            type="date"
            value={dateTo}
            onChange={handleDateToChange}
            className="min-h-[44px] w-full rounded-md border border-input bg-background px-4 py-2 text-foreground sm:w-auto"
          />
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="min-h-[44px] shrink-0 rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 sm:px-6"
        >
          Add expense
        </button>
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add expense</DialogTitle>
          </DialogHeader>
          <AddExpenseForm onAdded={handleAdded} />
        </DialogContent>
      </Dialog>

      {isPending && initial.expenses.length === 0 ? (
        <div className="min-h-[120px] space-y-3">
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : (
        <>
          <ExpenseTable
            expenses={initial.expenses}
            onUpdated={() => startTransition(() => router.refresh())}
          />
          <div className="min-w-0 overflow-x-auto">
            <WheelPagination
              totalPages={initial.totalPages}
              visibleCount={7}
              value={initial.page - 1}
              onChange={handlePageChange}
              className="bg-background"
            />
          </div>
        </>
      )}
    </div>
  );
}
