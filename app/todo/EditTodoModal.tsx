"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Todo, TodoPriority, TodoRepeatRule, TodoRepeatUnit, TodoStatus } from "@/types/todo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_OPTIONS: TodoStatus[] = ["pending", "cancel", "completed", "archived"];
const PRIORITY_OPTIONS: TodoPriority[] = ["low", "medium", "high"];
const REPEAT_OPTIONS: TodoRepeatRule[] = ["none", "daily", "weekly", "monthly", "yearly", "custom"];
const REPEAT_UNIT_OPTIONS: TodoRepeatUnit[] = ["day", "week", "month"];

type EditTodoModalProps = {
  todo: Todo;
  onClose: () => void;
  onSaved: () => void;
};

/** Format Date for datetime-local input (YYYY-MM-DDTHH:mm) */
function toDateTimeLocalValue(d: Date | null): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().slice(0, 16);
}

export default function EditTodoModal({ todo, onClose, onSaved }: EditTodoModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [status, setStatus] = useState<TodoStatus>(todo.status);
  const [priority, setPriority] = useState<TodoPriority | "">(todo.priority ?? "");
  const [dueDateTime, setDueDateTime] = useState(toDateTimeLocalValue(todo.dueDate));
  const [repeatRule, setRepeatRule] = useState<TodoRepeatRule>(todo.repeatRule ?? "none");
  const [repeatInterval, setRepeatInterval] = useState(todo.repeatInterval ?? 1);
  const [repeatUnit, setRepeatUnit] = useState<TodoRepeatUnit>(todo.repeatUnit ?? "day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(todo.title);
    setStatus(todo.status);
    setPriority(todo.priority ?? "");
    setDueDateTime(toDateTimeLocalValue(todo.dueDate));
    setRepeatRule(todo.repeatRule ?? "none");
    setRepeatInterval(todo.repeatInterval ?? 1);
    setRepeatUnit(todo.repeatUnit ?? "day");
  }, [todo]);

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
      } else {
        payload.repeatInterval = null;
        payload.repeatUnit = null;
      }
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        const message = data?.error ?? "Failed to update";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Task updated");
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
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="edit-todo-title" className="mb-1 block text-sm font-medium text-foreground">
              Title
            </label>
            <input
              id="edit-todo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="edit-todo-status" className="mb-1 block text-sm font-medium text-foreground">
              Status
            </label>
            <select
              id="edit-todo-status"
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
            <label htmlFor="edit-todo-priority" className="mb-1 block text-sm font-medium text-foreground">
              Priority
            </label>
            <select
              id="edit-todo-priority"
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
            <label htmlFor="edit-todo-due" className="mb-1 block text-sm font-medium text-foreground">
              Due date & time
            </label>
            <input
              id="edit-todo-due"
              type="datetime-local"
              value={dueDateTime}
              onChange={(e) => setDueDateTime(e.target.value)}
              disabled={loading}
              className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="edit-todo-repeat" className="mb-1 block text-sm font-medium text-foreground">
              Repeat
            </label>
            <select
              id="edit-todo-repeat"
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
                <label htmlFor="edit-todo-repeat-interval" className="mb-1 block text-sm font-medium text-foreground">
                  Every
                </label>
                <input
                  id="edit-todo-repeat-interval"
                  type="number"
                  min={1}
                  value={repeatInterval}
                  onChange={(e) => setRepeatInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  disabled={loading}
                  className="min-h-[44px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="edit-todo-repeat-unit" className="mb-1 block text-sm font-medium text-foreground">
                  Unit
                </label>
                <select
                  id="edit-todo-repeat-unit"
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
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex-1 rounded-lg border border-border bg-background px-4 py-3 text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
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
