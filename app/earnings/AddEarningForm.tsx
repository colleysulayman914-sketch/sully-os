"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { EarningCategory, ExpensePaymentMethod } from "@/types/earning";
import { EARNING_CATEGORIES, PAYMENT_METHODS } from "@/types/earning";

type AddEarningFormProps = {
  onAdded: () => void;
};

export default function AddEarningForm({ onAdded }: AddEarningFormProps) {
  const [amountDollars, setAmountDollars] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<EarningCategory | "">("");
  const [fromWhom, setFromWhom] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod | "">("");
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
      const res = await fetch("/api/earning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          date: new Date(date).toISOString(),
          category: category || null,
          fromWhom: fromWhom.trim() || null,
          paymentMethod: paymentMethod || null,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data?.error ?? "Failed to add earning";
        setError(message);
        toast.error(message);
        return;
      }
      setAmountDollars("");
      setDate("");
      setCategory("");
      setFromWhom("");
      setPaymentMethod("");
      setNote("");
      toast.success("Earning added");
      onAdded();
    } catch {
      setError("Failed to add earning");
      toast.error("Failed to add earning");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="earning-amount"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Amount (D)
        </label>
        <input
          id="earning-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amountDollars}
          onChange={(e) => setAmountDollars(e.target.value)}
          placeholder="0.00"
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-describedby={error ? "earning-error" : undefined}
        />
      </div>
      <div>
        <label
          htmlFor="earning-date"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Date
        </label>
        <input
          id="earning-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label
          htmlFor="earning-category"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Category
        </label>
        <select
          id="earning-category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as EarningCategory | "")
          }
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
        >
          <option value="">—</option>
          {EARNING_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="earning-fromWhom"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          From whom
        </label>
        <input
          id="earning-fromWhom"
          type="text"
          value={fromWhom}
          onChange={(e) => setFromWhom(e.target.value)}
          placeholder="Who you received the money from"
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label
          htmlFor="earning-paymentMethod"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Payment method
        </label>
        <select
          id="earning-paymentMethod"
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
          htmlFor="earning-note"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Note (optional)
        </label>
        <input
          id="earning-note"
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
          {loading ? "Adding…" : "Add earning"}
        </button>
      </div>
      {error && (
        <p id="earning-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
