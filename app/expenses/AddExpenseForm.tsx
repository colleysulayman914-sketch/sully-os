"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ExpenseCategory } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/types/expense";

type AddExpenseFormProps = {
  onAdded: () => void;
};

export default function AddExpenseForm({ onAdded }: AddExpenseFormProps) {
  const [amountDollars, setAmountDollars] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          date: new Date(date).toISOString(),
          category: category || null,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data?.error ?? "Failed to add expense";
        setError(message);
        toast.error(message);
        return;
      }
      setAmountDollars("");
      setDate("");
      setCategory("");
      setNote("");
      toast.success("Expense added");
      onAdded();
    } catch {
      setError("Failed to add expense");
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="expense-amount"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Amount ($)
        </label>
        <input
          id="expense-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amountDollars}
          onChange={(e) => setAmountDollars(e.target.value)}
          placeholder="0.00"
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-describedby={error ? "expense-error" : undefined}
        />
      </div>
      <div>
        <label
          htmlFor="expense-date"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Date
        </label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label
          htmlFor="expense-category"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Category
        </label>
        <select
          id="expense-category"
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
          htmlFor="expense-note"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Note (optional)
        </label>
        <input
          id="expense-note"
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
          type="submit"
          disabled={
            loading ||
            !amountDollars.trim() ||
            parseFloat(amountDollars) <= 0 ||
            !date.trim()
          }
          className="min-h-[44px] min-w-[44px] flex-1 rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add expense"}
        </button>
      </div>
      {error && (
        <p id="expense-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
