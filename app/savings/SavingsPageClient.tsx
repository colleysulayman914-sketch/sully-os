"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CirclePlus,
  FolderPlus,
  PiggyBank,
  Target,
} from "lucide-react";
import type { SavingsSummary } from "@/types/savings";
import AddSavingsDepositForm from "./AddSavingsDepositForm";
import SetGoalModal from "./SetGoalModal";
import AddCategoryForm from "./AddCategoryForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SavingsPageClientProps = {
  initialSummary: SavingsSummary;
  openAdd?: boolean;
};

function formatGMD(cents: number): string {
  return new Intl.NumberFormat("en-GM", {
    style: "currency",
    currency: "GMD",
  }).format(cents / 100);
}

export default function SavingsPageClient({
  initialSummary,
  openAdd = false,
}: SavingsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addModalOpen, setAddModalOpen] = useState(openAdd);
  const [goalModal, setGoalModal] = useState<{
    category: string;
    goalCents: number | null;
  } | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const handleAdded = () => {
    setAddModalOpen(false);
    startTransition(() => router.refresh());
  };

  const handleGoalSaved = () => {
    setGoalModal(null);
    startTransition(() => router.refresh());
  };

  const handleCategoryAdded = () => {
    setAddCategoryOpen(false);
    startTransition(() => router.refresh());
  };

  useEffect(() => {
    if (openAdd) {
      router.replace("/savings", { scroll: false });
    }
  }, [openAdd, router]);

  const categoryNames = initialSummary.categories.map((c) => c.category);

  return (
    <div className="mt-6 flex min-w-0 flex-col gap-6 overflow-x-hidden">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => setAddCategoryOpen(true)}
          className="flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-foreground hover:bg-muted sm:px-6"
        >
          <FolderPlus className="size-5 shrink-0" aria-hidden />
          Add category
        </button>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 sm:px-6"
        >
          <CirclePlus className="size-5 shrink-0" aria-hidden />
          Add deposit
        </button>
      </div>

      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] max-h-[85vh] overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              Add category
            </DialogTitle>
          </DialogHeader>
          <AddCategoryForm onAdded={handleCategoryAdded} />
        </DialogContent>
      </Dialog>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] max-h-[85vh] overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiggyBank className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              Add deposit
            </DialogTitle>
          </DialogHeader>
          <AddSavingsDepositForm
            categoryNames={categoryNames}
            onAdded={handleAdded}
          />
        </DialogContent>
      </Dialog>

      {goalModal && (
        <SetGoalModal
          category={goalModal.category}
          currentGoalCents={goalModal.goalCents}
          onClose={() => setGoalModal(null)}
          onSaved={handleGoalSaved}
        />
      )}

      {isPending ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: Math.max(4, categoryNames.length) }).map(
            (_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg border border-border bg-muted/30"
                aria-hidden
              />
            )
          )}
        </div>
      ) : (
        <section
          className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"
          aria-label="Savings by category"
        >
          {initialSummary.categories.map((item) => {
            const progress =
              item.goalCents != null && item.goalCents > 0
                ? Math.min(100, (item.totalCents / item.goalCents) * 100)
                : null;
            return (
              <div
                key={item.category}
                className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                    <PiggyBank className="size-5 shrink-0" aria-hidden />
                    <span className="text-sm font-medium truncate">
                      {item.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGoalModal({
                        category: item.category,
                        goalCents: item.goalCents,
                      })
                    }
                    className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
                    aria-label={`Set goal for ${item.category}`}
                  >
                    <Target className="size-4 shrink-0" aria-hidden />
                    <span className="hidden sm:inline">
                      {item.goalCents != null ? "Edit goal" : "Set goal"}
                    </span>
                  </button>
                </div>
                <p className="text-xl font-semibold text-foreground tabular-nums sm:text-2xl">
                  {formatGMD(item.totalCents)}
                </p>
                {item.goalCents != null && item.goalCents > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {formatGMD(item.totalCents)} / {formatGMD(item.goalCents)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress ?? 0}%` }}
                        role="progressbar"
                        aria-valuenow={progress ?? 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.category} savings progress`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
