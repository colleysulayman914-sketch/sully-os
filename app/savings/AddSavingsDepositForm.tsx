"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Banknote, Calendar, FileText, Plus, Tag } from "lucide-react";

type AddSavingsDepositFormProps = {
  categoryNames: string[];
  onAdded: () => void;
};

export default function AddSavingsDepositForm({
  categoryNames,
  onAdded,
}: AddSavingsDepositFormProps) {
  const [amountDollars, setAmountDollars] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
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
    if (!category) {
      setError("Category is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/savings/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          date: new Date(date).toISOString(),
          category,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data?.error ?? "Failed to add deposit";
        setError(message);
        toast.error(message);
        return;
      }
      setAmountDollars("");
      setDate("");
      setCategory("");
      setNote("");
      toast.success("Deposit added");
      onAdded();
    } catch {
      setError("Failed to add deposit");
      toast.error("Failed to add deposit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="savings-deposit-category"
          className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <Tag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Category
        </label>
        <select
          id="savings-deposit-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
        >
          <option value="">Select category</option>
          {categoryNames.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="savings-deposit-amount"
          className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <Banknote className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Amount (D)
        </label>
        <input
          id="savings-deposit-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amountDollars}
          onChange={(e) => setAmountDollars(e.target.value)}
          placeholder="0.00"
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label
          htmlFor="savings-deposit-date"
          className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <Calendar className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Date
        </label>
        <input
          id="savings-deposit-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label
          htmlFor="savings-deposit-note"
          className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Note (optional)
        </label>
        <input
          id="savings-deposit-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        type="submit"
        disabled={
          loading ||
          !amountDollars.trim() ||
          parseFloat(amountDollars) <= 0 ||
          !date.trim() ||
          !category
        }
        className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 disabled:opacity-50"
      >
        <Plus className="size-5 shrink-0" aria-hidden />
        {loading ? "Adding…" : "Add deposit"}
      </button>
      {error && (
        <p id="savings-deposit-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
