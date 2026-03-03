"use client";

import { useState } from "react";
import type { Todo, TodoStatus } from "@/types/todo";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Archive, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: TodoStatus[] = ["pending", "cancel", "completed", "archived"];

type TodoTableProps = {
  todos: Todo[];
  onUpdated: () => void;
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TodoTable({ todos, onUpdated }: TodoTableProps) {
  return (
    <div className="relative max-w-full overflow-auto rounded-md border border-border bg-background">
      <Table aria-label="Todo list">
        <TableHeader>
          <Column width={48} minWidth={48}>
            Done
          </Column>
          <Column isRowHeader>Title</Column>
          <Column>Status</Column>
          <Column>Created</Column>
          <Column width={120}>Actions</Column>
        </TableHeader>
        <TableBody>
          {todos.length === 0 ? (
            <Row>
              <Cell colSpan={5} className="h-24 text-center text-muted-foreground">
                No tasks yet. Add one above.
              </Cell>
            </Row>
          ) : (
            todos.map((todo) => (
              <TodoRow key={todo.id} todo={todo} onUpdated={onUpdated} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TodoRow({ todo, onUpdated }: { todo: Todo; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [loading, setLoading] = useState(false);

  async function handleToggleCompleted() {
    setLoading(true);
    try {
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (res.ok) onUpdated();
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: TodoStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) onUpdated();
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTitle() {
    const trimmed = editTitle.trim();
    if (trimmed === todo.title || !trimmed) {
      setEditing(false);
      setEditTitle(todo.title);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        setEditing(false);
        onUpdated();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (res.ok) onUpdated();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/todo/${todo.id}`, { method: "DELETE" });
      if (res.ok) onUpdated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Row>
      <Cell>
        <Checkbox
          isSelected={todo.completed}
          onChange={handleToggleCompleted}
          isDisabled={loading}
          aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
        />
      </Cell>
      <Cell>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setEditTitle(todo.title);
                  setEditing(false);
                }
              }}
              disabled={loading}
              autoFocus
              className="min-h-[44px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button size="sm" onPress={handleSaveTitle} isDisabled={loading}>
              Save
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "min-h-[44px] text-left w-full rounded-md px-2 -mx-2 hover:bg-accent",
              todo.completed && "text-muted-foreground line-through"
            )}
          >
            {todo.title}
          </button>
        )}
      </Cell>
      <Cell>
        <select
          value={todo.status}
          onChange={(e) => handleStatusChange(e.target.value as TodoStatus)}
          disabled={loading}
          className="min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Task status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Cell>
      <Cell className="text-muted-foreground">{formatDate(todo.createdAt)}</Cell>
      <Cell>
        <div className="flex items-center gap-1">
          {todo.status !== "archived" && (
            <Button
              variant="ghost"
              size="icon"
              onPress={handleArchive}
              isDisabled={loading}
              aria-label="Archive task"
              className="min-h-[44px] min-w-[44px]"
            >
              <Archive className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setEditing(true)}
            isDisabled={loading}
            aria-label="Edit task"
            className="min-h-[44px] min-w-[44px]"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onPress={handleDelete}
            isDisabled={loading}
            aria-label="Delete task"
            className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </Cell>
    </Row>
  );
}
