"use client";

import { useState } from "react";

type AddTodoFormProps = {
  onAdded: () => void;
};

export default function AddTodoForm({ onAdded }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to add task");
        return;
      }
      setTitle("");
      onAdded();
    } catch {
      setError("Failed to add task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:gap-3">
      <label htmlFor="todo-title" className="sr-only">
        New task title
      </label>
      <input
        id="todo-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        disabled={loading}
        className="min-h-[44px] flex-1 rounded-lg border border-foreground/20 bg-background px-4 py-3 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
        aria-describedby={error ? "todo-error" : undefined}
      />
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="min-h-[44px] min-w-[44px] rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 disabled:opacity-50 sm:px-6"
      >
        {loading ? "Adding…" : "Add"}
      </button>
      {error && (
        <p id="todo-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
