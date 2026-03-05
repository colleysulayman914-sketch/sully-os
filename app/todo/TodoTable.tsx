"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import type { Todo, TodoStatus } from "@/types/todo";
import type { DisplayStatus } from "@/types/todo";
import { getDisplayStatus } from "@/types/todo";
import { Badge } from "@/components/ui/badge";
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
import { Archive, Check, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import EditTodoModal from "./EditTodoModal";

const STATUS_OPTIONS: TodoStatus[] = ["pending", "cancel", "completed", "archived"];

function StatusTag({ displayStatus }: { displayStatus: DisplayStatus }) {
  const variant =
    displayStatus === "overdue"
      ? "overdue"
      : displayStatus === "completed"
        ? "completed"
        : displayStatus === "archived"
          ? "archived"
          : displayStatus === "pending"
            ? "pending"
            : displayStatus === "cancel"
              ? "cancel"
              : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {displayStatus}
    </Badge>
  );
}

type TodoTableProps = {
  todos: Todo[];
  onUpdated: () => void;
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRepeatLabel(todo: Todo): string {
  const rule = todo.repeatRule;
  if (!rule || rule === "none") return "—";
  if (rule === "daily") return "Daily";
  if (rule === "weekly") return "Weekly";
  if (rule === "monthly") return "Monthly";
  if (rule === "yearly") return "Yearly";
  if (rule === "custom" && todo.repeatInterval != null && todo.repeatUnit) {
    const unit = todo.repeatUnit === "day" ? "days" : todo.repeatUnit === "week" ? "weeks" : "months";
    return `Every ${todo.repeatInterval} ${unit}`;
  }
  return "—";
}

export default function TodoTable({ todos, onUpdated }: TodoTableProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="relative max-w-full overflow-auto rounded-md border border-border bg-background">
        <div className="min-h-[120px] animate-pulse bg-muted/30" aria-hidden />
      </div>
    );
  }

  const emptyMessage = (
    <p className="py-8 text-center text-muted-foreground">No tasks yet. Add one above.</p>
  );

  return (
    <>
      {/* Mobile: card list */}
      <div className="min-w-0 space-y-3 md:hidden">
        {todos.length === 0 ? (
          emptyMessage
        ) : (
          todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onUpdated={onUpdated} />
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="relative hidden min-w-0 max-w-full overflow-auto rounded-md border border-border bg-background md:block">
        <Table aria-label="Todo list">
          <TableHeader>
            <Column width={48} minWidth={48}>
              Done
            </Column>
            <Column isRowHeader>Title</Column>
            <Column>Status</Column>
            <Column>Priority</Column>
            <Column>Repeat</Column>
            <Column>Due</Column>
            <Column>Created</Column>
            <Column width={56}>Actions</Column>
          </TableHeader>
          <TableBody>
            {todos.length === 0 ? (
              <Row>
                <Cell colSpan={8} className="h-24 text-center text-muted-foreground">
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
    </>
  );
}

type TodoActions = {
  loading: boolean;
  handleToggleCompleted: () => void;
  handleArchive: () => void;
  handleMarkCompleted: () => void;
  handleMarkIncomplete: () => void;
  handleDelete: () => void;
  editModalOpen: boolean;
  setEditModalOpen: (v: boolean) => void;
};

function useTodoActions(todo: Todo, onUpdated: () => void): TodoActions {
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleToggleCompleted = useCallback(() => {
    setLoading(true);
    fetch(`/api/todo/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    })
      .then(async (res) => {
        if (res.ok) {
          toast.success("Task updated");
          onUpdated();
        } else {
          const data = await res.json();
          toast.error(data?.error ?? "Failed to update task");
        }
      })
      .catch(() => toast.error("Failed to update task"))
      .finally(() => setLoading(false));
  }, [todo.id, onUpdated]);

  const handleArchive = useCallback(() => {
    setLoading(true);
    fetch(`/api/todo/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    })
      .then(async (res) => {
        if (res.ok) {
          toast.success("Archived");
          onUpdated();
        } else {
          const data = await res.json();
          toast.error(data?.error ?? "Failed to archive");
        }
      })
      .catch(() => toast.error("Failed to archive"))
      .finally(() => setLoading(false));
  }, [todo.id, onUpdated]);

  const handleMarkCompleted = useCallback(() => {
    setLoading(true);
    fetch(`/api/todo/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true, status: "completed" }),
    })
      .then(async (res) => {
        if (res.ok) {
          toast.success("Marked complete");
          onUpdated();
        } else {
          const data = await res.json();
          toast.error(data?.error ?? "Failed to update");
        }
      })
      .catch(() => toast.error("Failed to update"))
      .finally(() => setLoading(false));
  }, [todo.id, onUpdated]);

  const handleMarkIncomplete = useCallback(() => {
    setLoading(true);
    fetch(`/api/todo/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: false, status: "pending" }),
    })
      .then(async (res) => {
        if (res.ok) {
          toast.success("Marked incomplete");
          onUpdated();
        } else {
          const data = await res.json();
          toast.error(data?.error ?? "Failed to update");
        }
      })
      .catch(() => toast.error("Failed to update"))
      .finally(() => setLoading(false));
  }, [todo.id, onUpdated]);

  const handleDelete = useCallback(() => {
    if (!confirm("Delete this task?")) return;
    setLoading(true);
    fetch(`/api/todo/${todo.id}`, { method: "DELETE" })
      .then(async (res) => {
        if (res.ok) {
          toast.success("Task deleted");
          onUpdated();
        } else {
          const data = await res.json();
          toast.error(data?.error ?? "Failed to delete");
        }
      })
      .catch(() => toast.error("Failed to delete"))
      .finally(() => setLoading(false));
  }, [todo.id, onUpdated]);

  return {
    loading,
    handleToggleCompleted,
    handleArchive,
    handleMarkCompleted,
    handleMarkIncomplete,
    handleDelete,
    editModalOpen,
    setEditModalOpen,
  };
}

const menuItemClass =
  "flex w-full min-h-[44px] items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50";

function TodoActionsMenu({
  todo,
  actions,
  onUpdated,
}: {
  todo: Todo;
  actions: TodoActions;
  onUpdated: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      setMenuPosition(null);
      return;
    }
    const btn = triggerRef.current?.querySelector("button");
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="relative flex justify-end" ref={triggerRef}>
      <Button
        variant="ghost"
        size="icon"
        onPress={() => setMenuOpen((o) => !o)}
        isDisabled={actions.loading}
        aria-label="More actions"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className="min-h-[44px] min-w-[44px]"
      >
        <MoreVertical className="size-5" />
      </Button>
      {menuOpen &&
        menuPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 min-w-[160px] rounded-md border border-border bg-background py-1 shadow-lg"
            style={{ top: menuPosition.top, right: menuPosition.right }}
          >
            {todo.completed ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  actions.handleMarkIncomplete();
                }}
                disabled={actions.loading}
                className={menuItemClass}
              >
                <Check className="size-4 shrink-0" />
                Mark as incomplete
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  actions.handleMarkCompleted();
                }}
                disabled={actions.loading}
                className={menuItemClass}
              >
                <Check className="size-4 shrink-0" />
                Mark as completed
              </button>
            )}
            {String(todo.status) !== "archived" && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  actions.handleArchive();
                }}
                disabled={actions.loading}
                className={menuItemClass}
              >
                <Archive className="size-4 shrink-0" />
                Archive
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                actions.setEditModalOpen(true);
              }}
              disabled={actions.loading}
              className={menuItemClass}
            >
              <Pencil className="size-4 shrink-0" />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                actions.handleDelete();
              }}
              disabled={actions.loading}
              className={cn(menuItemClass, "text-destructive hover:text-destructive")}
            >
              <Trash2 className="size-4 shrink-0" />
              Delete
            </button>
          </div>,
          document.body
        )}
      {actions.editModalOpen && (
        <EditTodoModal
          todo={todo}
          onClose={() => actions.setEditModalOpen(false)}
          onSaved={onUpdated}
        />
      )}
    </div>
  );
}

function TodoRow({ todo, onUpdated }: { todo: Todo; onUpdated: () => void }) {
  const actions = useTodoActions(todo, onUpdated);

  return (
    <Row>
      <Cell>
        <Checkbox
          isSelected={todo.completed}
          onChange={actions.handleToggleCompleted}
          isDisabled={actions.loading}
          aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
        />
      </Cell>
      <Cell>
        <span
          className={cn(
            "block min-h-[44px] py-2",
            todo.completed && "text-muted-foreground line-through"
          )}
        >
          {todo.title}
        </span>
      </Cell>
      <Cell>
        <StatusTag displayStatus={getDisplayStatus(todo)} />
      </Cell>
      <Cell className="capitalize text-muted-foreground">
        {todo.priority ?? "—"}
      </Cell>
      <Cell className="text-muted-foreground">
        {formatRepeatLabel(todo)}
      </Cell>
      <Cell className="text-muted-foreground">
        {todo.dueDate ? formatDateTime(todo.dueDate) : "—"}
      </Cell>
      <Cell className="text-muted-foreground">{formatDate(todo.createdAt)}</Cell>
      <Cell>
        <TodoActionsMenu todo={todo} actions={actions} onUpdated={onUpdated} />
      </Cell>
    </Row>
  );
}

function TodoCard({ todo, onUpdated }: { todo: Todo; onUpdated: () => void }) {
  const actions = useTodoActions(todo, onUpdated);

  return (
    <article
      className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm"
      aria-label={`Task: ${todo.title}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center pt-1">
          <Checkbox
            isSelected={todo.completed}
            onChange={actions.handleToggleCompleted}
            isDisabled={actions.loading}
            aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-medium text-foreground",
              todo.completed && "text-muted-foreground line-through"
            )}
          >
            {todo.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusTag displayStatus={getDisplayStatus(todo)} />
            {todo.priority && (
              <span className="text-xs capitalize text-muted-foreground">
                {todo.priority}
              </span>
            )}
            {formatRepeatLabel(todo) !== "—" && (
              <span className="text-xs text-muted-foreground">
                {formatRepeatLabel(todo)}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Due: {todo.dueDate ? formatDateTime(todo.dueDate) : "—"}
            </span>
          </div>
        </div>
        <TodoActionsMenu todo={todo} actions={actions} onUpdated={onUpdated} />
      </div>
    </article>
  );
}
