"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { TodoPriority, TodoStatus } from "@/types/todo";

const STATUS_OPTIONS: TodoStatus[] = ["pending", "cancel", "completed", "archived"];
const PRIORITY_OPTIONS: TodoPriority[] = ["low", "medium", "high"];

type AddTodoFormProps = {
  onAdded: () => void;
};

export default function AddTodoForm({ onAdded }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TodoStatus>("pending");
  const [priority, setPriority] = useState<TodoPriority | "">("");
  const [dueDateTime, setDueDateTime] = useState("");
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
        body: JSON.stringify({
          title: trimmed,
          status,
          priority: priority || null,
          dueDate: dueDateTime || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data?.error ?? "Failed to add task";
        setError(message);
        toast.error(message);
        return;
      }
      setTitle("");
      setStatus("pending");
      setPriority("");
      setDueDateTime("");
      toast.success("Task added");
      onAdded();
    } catch {
      setError("Failed to add task");
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="todo-title" className="mb-1 block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-describedby={error ? "todo-error" : undefined}
        />
      </div>
      <div>
        <label htmlFor="todo-status-add" className="mb-1 block text-sm font-medium text-foreground">
          Status
        </label>
        <select
          id="todo-status-add"
          value={status}
          onChange={(e) => setStatus(e.target.value as TodoStatus)}
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="todo-priority-add" className="mb-1 block text-sm font-medium text-foreground">
          Priority
        </label>
        <select
          id="todo-priority-add"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority | "")}
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
        >
          <option value="">None</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="todo-due-add" className="mb-1 block text-sm font-medium text-foreground">
          Due date & time
        </label>
        <input
          id="todo-due-add"
          type="datetime-local"
          value={dueDateTime}
          onChange={(e) => setDueDateTime(e.target.value)}
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="min-h-[44px] min-w-[44px] flex-1 rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add task"}
        </button>
      </div>
      {error && (
        <p id="todo-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
