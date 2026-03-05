"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { TodoPriority, TodoRepeatRule, TodoRepeatUnit, TodoStatus } from "@/types/todo";

const STATUS_OPTIONS: TodoStatus[] = ["pending", "cancel", "completed", "archived"];
const PRIORITY_OPTIONS: TodoPriority[] = ["low", "medium", "high"];
const REPEAT_OPTIONS: TodoRepeatRule[] = ["none", "daily", "weekly", "monthly", "yearly", "custom"];
const REPEAT_UNIT_OPTIONS: TodoRepeatUnit[] = ["day", "week", "month"];

type AddTodoFormProps = {
  onAdded: () => void;
};

export default function AddTodoForm({ onAdded }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TodoStatus>("pending");
  const [priority, setPriority] = useState<TodoPriority | "">("");
  const [dueDateTime, setDueDateTime] = useState("");
  const [repeatRule, setRepeatRule] = useState<TodoRepeatRule>("none");
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatUnit, setRepeatUnit] = useState<TodoRepeatUnit>("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: trimmed,
        status,
        priority: priority || null,
        dueDate: dueDateTime || null,
        repeatRule: repeatRule === "none" ? null : repeatRule,
      };
      if (repeatRule === "custom") {
        payload.repeatInterval = Math.max(1, repeatInterval);
        payload.repeatUnit = repeatUnit;
      }
      const res = await fetch("/api/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      setRepeatRule("none");
      setRepeatInterval(1);
      setRepeatUnit("day");
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
      <div>
        <label htmlFor="todo-repeat-add" className="mb-1 block text-sm font-medium text-foreground">
          Repeat
        </label>
        <select
          id="todo-repeat-add"
          value={repeatRule}
          onChange={(e) => setRepeatRule(e.target.value as TodoRepeatRule)}
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
        >
          {REPEAT_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r === "none" ? "None" : r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {repeatRule === "custom" && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="todo-repeat-interval-add" className="mb-1 block text-sm font-medium text-foreground">
              Every
            </label>
            <input
              id="todo-repeat-interval-add"
              type="number"
              min={1}
              value={repeatInterval}
              onChange={(e) => setRepeatInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="todo-repeat-unit-add" className="mb-1 block text-sm font-medium text-foreground">
              Unit
            </label>
            <select
              id="todo-repeat-unit-add"
              value={repeatUnit}
              onChange={(e) => setRepeatUnit(e.target.value as TodoRepeatUnit)}
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
            >
              {REPEAT_UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u === "day" ? "Days" : u === "week" ? "Weeks" : "Months"}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
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
