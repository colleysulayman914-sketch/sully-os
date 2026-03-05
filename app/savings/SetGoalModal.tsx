"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SetGoalModalProps = {
  category: string;
  currentGoalCents: number | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function SetGoalModal({
  category,
  currentGoalCents,
  onClose,
  onSaved,
}: SetGoalModalProps) {
  const [targetDollars, setTargetDollars] = useState(
    currentGoalCents != null ? (currentGoalCents / 100).toFixed(2) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTargetDollars(
      currentGoalCents != null ? (currentGoalCents / 100).toFixed(2) : ""
    );
  }, [category, currentGoalCents]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const amount = parseFloat(targetDollars);
    const targetAmountCents =
      targetDollars.trim() === "" || Number.isNaN(amount) || amount < 0
        ? 0
        : Math.round(amount * 100);
    setLoading(true);
    try {
      const res = await fetch("/api/savings/goal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          targetAmountCents,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data?.error ?? "Failed to set goal";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success(
        targetAmountCents === 0 ? "Goal removed" : "Goal updated"
      );
      onSaved();
      onClose();
    } catch {
      setError("Failed to set goal");
      toast.error("Failed to set goal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] max-h-[85vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            Set goal — {category}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="savings-goal-target"
              className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              Target amount (D)
            </label>
            <input
              id="savings-goal-target"
              type="number"
              step="0.01"
              min="0"
              value={targetDollars}
              onChange={(e) => setTargetDollars(e.target.value)}
              placeholder="0.00"
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Set to 0 or leave empty and save to remove the goal.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-background hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
