"use client";

import { useCallback, useState } from "react";
import type { TodoListResponse, TodoStatus } from "@/types/todo";
import AddTodoForm from "./AddTodoForm";
import TodoTable from "./TodoTable";
import WheelPagination from "@/components/ui/wheel-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const handleAdded = useCallback(() => {
    refetch();
    setAddModalOpen(false);
  }, [refetch]);

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="min-h-[44px] shrink-0 rounded-lg bg-foreground px-5 py-3 text-background hover:opacity-90 sm:px-6"
        >
          Add task
        </button>
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add task</DialogTitle>
          </DialogHeader>
          <AddTodoForm onAdded={handleAdded} />
        </DialogContent>
      </Dialog>

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
