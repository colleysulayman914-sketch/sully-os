"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Tag } from "lucide-react";

type AddCategoryFormProps = {
  onAdded: () => void;
};

export default function AddCategoryForm({ onAdded }: AddCategoryFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/savings/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data?.error ?? "Failed to add category";
        setError(message);
        toast.error(message);
        return;
      }
      setName("");
      toast.success("Category added");
      onAdded();
    } catch {
      setError("Failed to add category");
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="savings-category-name"
          className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <Tag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Category name
        </label>
        <input
          id="savings-category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Vacation, Car, Emergency fund"
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-describedby={error ? "category-error" : undefined}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 disabled:opacity-50"
      >
        <Plus className="size-5 shrink-0" aria-hidden />
        {loading ? "Adding…" : "Add category"}
      </button>
      {error && (
        <p id="category-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
