"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Earning, EarningCategory, ExpensePaymentMethod } from "@/types/earning";
import { EARNING_CATEGORIES, PAYMENT_METHODS } from "@/types/earning";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EditEarningModalProps = {
  earning: Earning;
  onClose: () => void;
  onSaved: () => void;
};

function toDateInputValue(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

export default function EditEarningModal({
  earning,
  onClose,
  onSaved,
}: EditEarningModalProps) {
  const [amountDollars, setAmountDollars] = useState(
    (earning.amountCents / 100).toFixed(2)
  );
  const [date, setDate] = useState(toDateInputValue(earning.date));
  const [category, setCategory] = useState<EarningCategory | "">(
    earning.category ?? ""
  );
  const [fromWhom, setFromWhom] = useState(earning.fromWhom ?? "");
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod | "">(
    earning.paymentMethod ?? ""
  );
  const [note, setNote] = useState(earning.note ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAmountDollars((earning.amountCents / 100).toFixed(2));
    setDate(toDateInputValue(earning.date));
    setCategory(earning.category ?? "");
    setFromWhom(earning.fromWhom ?? "");
    setPaymentMethod(earning.paymentMethod ?? "");
    setNote(earning.note ?? "");
  }, [earning]);

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
      const res = await fetch(`/api/earning/${earning.id}`, {
        method: "PATCH",
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
      if (!res.ok) {
        const data = await res.json();
        const message = data?.error ?? "Failed to update";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Earning updated");
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
          <DialogTitle>Edit earning</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="edit-earning-amount"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Amount (D)
            </label>
            <input
              id="edit-earning-amount"
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
              htmlFor="edit-earning-date"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Date
            </label>
            <input
              id="edit-earning-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label
              htmlFor="edit-earning-category"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Category
            </label>
            <select
              id="edit-earning-category"
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
              htmlFor="edit-earning-fromWhom"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              From whom
            </label>
            <input
              id="edit-earning-fromWhom"
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
              htmlFor="edit-earning-paymentMethod"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Payment method
            </label>
            <select
              id="edit-earning-paymentMethod"
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
              htmlFor="edit-earning-note"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Note (optional)
            </label>
            <input
              id="edit-earning-note"
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
