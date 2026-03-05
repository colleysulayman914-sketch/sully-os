"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Todo, TodoPriority, TodoStatus } from "@/types/todo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_OPTIONS: TodoStatus[] = ["pending", "cancel", "completed", "archived"];
const PRIORITY_OPTIONS: TodoPriority[] = ["low", "medium", "high"];

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(todo.title);
    setStatus(todo.status);
    setPriority(todo.priority ?? "");
    setDueDateTime(toDateTimeLocalValue(todo.dueDate));
  }, [todo]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmed,
          status,
          priority: priority || null,
          dueDate: dueDateTime || null,
        }),
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
