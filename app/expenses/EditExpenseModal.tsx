"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Expense, ExpenseCategory, ExpensePaymentMethod } from "@/types/expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/types/expense";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditExpenseModalProps = {
  expense: Expense;
  onClose: () => void;
  onSaved: () => void;
};

function toDateInputValue(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

export default function EditExpenseModal({
  expense,
  onClose,
  onSaved,
}: EditExpenseModalProps) {
  const [amountDollars, setAmountDollars] = useState(
    (expense.amountCents / 100).toFixed(2)
  );
  const [date, setDate] = useState(toDateInputValue(expense.date));
  const [category, setCategory] = useState<ExpenseCategory | "">(
    expense.category ?? ""
  );
  const [toWhom, setToWhom] = useState(expense.toWhom ?? "");
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod | "">(
    expense.paymentMethod ?? ""
  );
  const [note, setNote] = useState(expense.note ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAmountDollars((expense.amountCents / 100).toFixed(2));
    setDate(toDateInputValue(expense.date));
    setCategory(expense.category ?? "");
    setToWhom(expense.toWhom ?? "");
    setPaymentMethod(expense.paymentMethod ?? "");
    setNote(expense.note ?? "");
  }, [expense]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const amount = parseFloat(amountDollars);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    const amountCents = Math.round(amount * 100);
    if (!date.trim()) {
      setError("Date is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/expense/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          date: new Date(date).toISOString(),
          category: category || null,
          toWhom: toWhom.trim() || null,
          paymentMethod: paymentMethod || null,
          note: note.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        const message = data?.error ?? "Failed to update";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Expense updated");
      onSaved();
      onClose();
    } catch {
      setError("Failed to update");
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="edit-expense-amount"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Amount (D)
            </label>
            <input
              id="edit-expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amountDollars}
              onChange={(e) => setAmountDollars(e.target.value)}
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label
              htmlFor="edit-expense-date"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Date
            </label>
            <input
              id="edit-expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label
              htmlFor="edit-expense-category"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Category
            </label>
            <select
              id="edit-expense-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ExpenseCategory | "")
              }
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
            >
              <option value="">—</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="edit-expense-toWhom"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              To whom
            </label>
            <input
              id="edit-expense-toWhom"
              type="text"
              value={toWhom}
              onChange={(e) => setToWhom(e.target.value)}
              placeholder="Who you are giving the money to"
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label
              htmlFor="edit-expense-paymentMethod"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Payment method
            </label>
            <select
              id="edit-expense-paymentMethod"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as ExpensePaymentMethod | "")
              }
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
            >
              <option value="">—</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="edit-expense-note"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Note (optional)
            </label>
            <input
              id="edit-expense-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional description"
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
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
              disabled={
                loading ||
                !amountDollars.trim() ||
                parseFloat(amountDollars) <= 0 ||
                !date.trim()
              }
              className="min-h-[44px] min-w-[44px] flex-1 rounded-lg bg-foreground px-4 py-3 text-background hover:opacity-90 disabled:opacity-50"
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
