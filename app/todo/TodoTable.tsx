"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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

  return (
    <div className="relative max-w-full overflow-auto rounded-md border border-border bg-background">
      <Table aria-label="Todo list">
        <TableHeader>
          <Column width={48} minWidth={48}>
            Done
          </Column>
          <Column isRowHeader>Title</Column>
          <Column>Status</Column>
          <Column>Due</Column>
          <Column>Created</Column>
          <Column width={56}>Actions</Column>
        </TableHeader>
        <TableBody>
          {todos.length === 0 ? (
            <Row>
              <Cell colSpan={6} className="h-24 text-center text-muted-foreground">
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
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
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

  async function handleMarkCompleted() {
    setLoading(true);
    try {
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true, status: "completed" }),
      });
      if (res.ok) onUpdated();
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkIncomplete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/todo/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: false, status: "pending" }),
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
      <Cell className="text-muted-foreground">
        {todo.dueDate ? formatDate(todo.dueDate) : "—"}
      </Cell>
      <Cell className="text-muted-foreground">{formatDate(todo.createdAt)}</Cell>
      <Cell>
        <div className="relative flex justify-end" ref={triggerRef}>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setMenuOpen((o) => !o)}
            isDisabled={loading}
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
                      handleMarkIncomplete();
                    }}
                    disabled={loading}
                    className="flex w-full min-h-[44px] items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
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
                      handleMarkCompleted();
                    }}
                    disabled={loading}
                    className="flex w-full min-h-[44px] items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
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
                      handleArchive();
                    }}
                    disabled={loading}
                    className="flex w-full min-h-[44px] items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
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
                    setEditModalOpen(true);
                  }}
                  disabled={loading}
                  className="flex w-full min-h-[44px] items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  <Pencil className="size-4 shrink-0" />
                  Edit
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  disabled={loading}
                  className="flex w-full min-h-[44px] items-center gap-2 px-4 py-2 text-left text-sm text-destructive hover:bg-accent hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="size-4 shrink-0" />
                  Delete
                </button>
              </div>,
              document.body
            )}
          {editModalOpen && (
            <EditTodoModal
              todo={todo}
              onClose={() => setEditModalOpen(false)}
              onSaved={onUpdated}
            />
          )}
        </div>
      </Cell>
    </Row>
  );
}
