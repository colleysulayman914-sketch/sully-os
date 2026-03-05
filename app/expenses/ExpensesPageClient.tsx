"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExpenseListResponse, ExpenseCategory } from "@/types/expense";
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

  return (
    <div className="mt-6 flex min-w-0 flex-col gap-6">
      <div className="flex justify-end">
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
