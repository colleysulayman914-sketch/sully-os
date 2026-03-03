"use client";

import { useCallback, useEffect, useState } from "react";
import type { Todo, TodoListResponse, TodoStatus } from "@/types/todo";
import AddTodoForm from "./AddTodoForm";
import TodoTable from "./TodoTable";
import WheelPagination from "@/components/ui/wheel-pagination";

const DEFAULT_LIMIT = 10;
const STATUS_OPTIONS: { value: "" | TodoStatus; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "cancel", label: "Cancel" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

type TodoPageClientProps = {
  initial: TodoListResponse;
};

export default function TodoPageClient({ initial }: TodoPageClientProps) {
  const [data, setData] = useState<TodoListResponse>(initial);
  const [page, setPage] = useState(initial.page);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | TodoStatus>("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = useCallback(
    async (opts?: { page?: number; search?: string; status?: "" | TodoStatus }) => {
      setLoading(true);
      try {
        const p = opts?.page ?? page;
        const q = opts?.search !== undefined ? opts.search : search;
        const s = opts?.status !== undefined ? opts.status : statusFilter;
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("limit", String(DEFAULT_LIMIT));
        if (q) params.set("search", q);
        if (s) params.set("status", s);
        const res = await fetch(`/api/todo?${params}`);
        if (res.ok) {
          const json: TodoListResponse = await res.json();
          setData(json);
          setPage(json.page);
        }
      } finally {
        setLoading(false);
      }
    },
    [page, search, statusFilter]
  );

  const refetch = useCallback(() => {
    fetchTodos({ page: 1 });
  }, [fetchTodos]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchTodos({ page: 1, search: searchInput, status: statusFilter });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as "" | TodoStatus;
    setStatusFilter(v);
    fetchTodos({ page: 1, search, status: v });
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage + 1);
      fetchTodos({ page: newPage + 1 });
    },
    [fetchTodos]
  );

  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (!addModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [addModalOpen]);

  const handleAdded = useCallback(() => {
    refetch();
    setAddModalOpen(false);
  }, [refetch]);

  return (
    <div className="mt-6 flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setAddModalOpen(true)}
        className="min-h-[44px] min-w-[44px] rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 sm:px-6"
      >
        Add task
      </button>

      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-task-title"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setAddModalOpen(false)}
            className="absolute inset-0 bg-foreground/20"
          />
          <div className="relative w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
            <h2 id="add-task-title" className="text-lg font-semibold text-foreground">
              Add task
            </h2>
            <div className="mt-4">
              <AddTodoForm onAdded={handleAdded} />
            </div>
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-2xl text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label htmlFor="todo-search" className="sr-only">
          Search tasks
        </label>
        <input
          id="todo-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title…"
          className="min-h-[44px] flex-1 rounded-md border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="min-h-[44px] min-w-[44px] rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          Search
        </button>
        <label htmlFor="todo-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="todo-status"
          value={statusFilter}
          onChange={handleStatusChange}
          className="min-h-[44px] rounded-md border border-input bg-background px-4 py-2 text-foreground"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </form>

      {loading && data.todos.length === 0 ? (
        <div className="min-h-[120px] space-y-3">
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : (
        <>
          <TodoTable todos={data.todos} onUpdated={refetch} />
          <WheelPagination
            totalPages={data.totalPages}
            visibleCount={7}
            value={data.page - 1}
            onChange={handlePageChange}
            className="bg-background"
          />
        </>
      )}
    </div>
  );
}
