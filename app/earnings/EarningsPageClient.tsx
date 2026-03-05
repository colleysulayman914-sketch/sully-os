"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Calendar, CirclePlus, Filter, Tags } from "lucide-react";
import type { EarningListResponse, EarningCategory } from "@/types/earning";
import { EARNING_CATEGORIES } from "@/types/earning";
import AddEarningForm from "./AddEarningForm";
import EarningTable from "./EarningTable";
import WheelPagination from "@/components/ui/wheel-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EarningsPageClientProps = {
  initial: EarningListResponse;
  currentPage: number;
  categoryFilter: "" | EarningCategory;
  dateFrom: string;
  dateTo: string;
};

function buildEarningsUrl(params: {
  page?: number;
  category?: "" | EarningCategory;
  dateFrom?: string;
  dateTo?: string;
}) {
  const q = new URLSearchParams();
  if (params.page != null && params.page > 1) q.set("page", String(params.page));
  if (params.category) q.set("category", params.category);
  if (params.dateFrom) q.set("dateFrom", params.dateFrom);
  if (params.dateTo) q.set("dateTo", params.dateTo);
  const s = q.toString();
  return s ? `/earnings?${s}` : "/earnings";
}

export default function EarningsPageClient({
  initial,
  currentPage,
  categoryFilter,
  dateFrom,
  dateTo,
}: EarningsPageClientProps) {
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
        buildEarningsUrl({
          page: newPage + 1,
          category: categoryFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
      );
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as "" | EarningCategory;
    startTransition(() => {
      router.push(
        buildEarningsUrl({
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
        buildEarningsUrl({
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
        buildEarningsUrl({
          page: 1,
          category: categoryFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: v || undefined,
        })
      );
    });
  };

  return (
    <div className="mt-6 flex min-w-0 flex-col gap-6 overflow-x-hidden">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 sm:px-6"
        >
          <CirclePlus className="size-5 shrink-0" aria-hidden />
          Add earning
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <label htmlFor="earning-filter-category" className="sr-only">
          Filter by category
        </label>
        <div className="relative flex min-w-0 flex-1 sm:min-w-0 sm:w-auto sm:max-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground" aria-hidden>
            <Tags className="size-5" />
          </span>
          <select
            id="earning-filter-category"
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="min-h-[44px] w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-foreground sm:min-w-[180px]"
          >
            <option value="">All categories</option>
            {EARNING_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <label htmlFor="earning-filter-dateFrom" className="sr-only">
            From date
          </label>
          <div className="relative flex min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground" aria-hidden>
              <Calendar className="size-5" />
            </span>
            <input
              id="earning-filter-dateFrom"
              type="date"
              value={dateFrom}
              onChange={handleDateFromChange}
              className="min-h-[44px] w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-foreground sm:min-w-0"
            />
          </div>
          <label htmlFor="earning-filter-dateTo" className="sr-only">
            To date
          </label>
          <div className="relative flex min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground" aria-hidden>
              <Calendar className="size-5" />
            </span>
            <input
              id="earning-filter-dateTo"
              type="date"
              value={dateTo}
              onChange={handleDateToChange}
              className="min-h-[44px] w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-foreground sm:min-w-0"
            />
          </div>
        </div>
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] max-h-[85vh] overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              Add earning
            </DialogTitle>
          </DialogHeader>
          <AddEarningForm onAdded={handleAdded} />
        </DialogContent>
      </Dialog>

      {isPending && initial.earnings.length === 0 ? (
        <div className="flex min-h-[120px] flex-col gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="size-5 shrink-0" aria-hidden />
            <span className="text-sm">Loading…</span>
          </div>
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : (
        <>
          <EarningTable
            earnings={initial.earnings}
            onUpdated={() => startTransition(() => router.refresh())}
          />
          <div className="min-w-0 overflow-x-auto overflow-y-hidden">
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
