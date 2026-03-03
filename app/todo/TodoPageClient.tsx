"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

const STATUS_OPTIONS: { value: "" | TodoStatus; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "cancel", label: "Cancel" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

type TodoPageClientProps = {
  initial: TodoListResponse;
  currentPage: number;
  search: string;
  statusFilter: "" | TodoStatus;
};

function buildTodoUrl(params: {
  page?: number;
  search?: string;
  status?: "" | TodoStatus;
}) {
  const q = new URLSearchParams();
  if (params.page != null && params.page > 1) q.set("page", String(params.page));
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `/todo?${s}` : "/todo";
}

export default function TodoPageClient({
  initial,
  currentPage,
  search,
  statusFilter,
}: TodoPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(
        buildTodoUrl({ page: 1, search: searchInput.trim(), status: statusFilter })
      );
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as "" | TodoStatus;
    startTransition(() => {
      router.push(buildTodoUrl({ page: 1, search: searchInput.trim(), status: v }));
    });
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      router.push(
        buildTodoUrl({
          page: newPage + 1,
          search: searchInput.trim(),
          status: statusFilter,
        })
      );
    });
  };

  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAdded = () => {
    setAddModalOpen(false);
    startTransition(() => router.refresh());
  };

  return (
    <div className="mt-6 flex min-w-0 flex-col gap-6">
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

      <form
        onSubmit={handleSearchSubmit}
        className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
      >
        <label htmlFor="todo-search" className="sr-only">
          Search tasks
        </label>
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          <div className="relative flex min-w-0 flex-1">
            <input
              id="todo-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title…"
              className="min-h-[44px] w-full rounded-md border border-input bg-background py-2 pl-4 pr-12 text-foreground placeholder:text-muted-foreground sm:pr-4"
            />
            <button
              type="submit"
              aria-label="Search tasks"
              className="absolute right-0 top-0 flex h-full min-w-[44px] items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground sm:hidden"
            >
              <Search className="size-5" />
            </button>
          </div>
          <button
            type="submit"
            className="hidden min-h-[44px] shrink-0 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 sm:flex sm:min-w-[44px] sm:items-center sm:gap-2"
          >
            Search
          </button>
        </div>
        <label htmlFor="todo-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="todo-status"
          value={statusFilter}
          onChange={handleStatusChange}
          className="min-h-[44px] w-full rounded-md border border-input bg-background px-4 py-2 text-foreground sm:w-auto sm:min-w-[140px]"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </form>

      {isPending && initial.todos.length === 0 ? (
        <div className="min-h-[120px] space-y-3">
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : (
        <>
          <TodoTable
            todos={initial.todos}
            onUpdated={() => startTransition(() => router.refresh())}
          />
          <div className="min-w-0 overflow-x-auto">
            <WheelPagination
              totalPages={initial.totalPages}
              visibleCount={7}
              value={initial.page - 1}
              onChange={handlePageChange}
              className="bg-background"
            />
          </div>
        </>
      )}
    </div>
  );
}
