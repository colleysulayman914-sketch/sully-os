import AppShell from "@/components/AppShell";
import { getTodos } from "@/lib/todo";
import type { TodoStatus } from "@/types/todo";
import TodoPageClient from "./TodoPageClient";

export const metadata = {
  title: "Todo",
};

const LIMIT = 3;
const STATUSES: TodoStatus[] = ["pending", "cancel", "completed", "archived"];

export default async function TodoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = (params.search ?? "").trim();
  const statusFilter =
    params.status && STATUSES.includes(params.status as TodoStatus)
      ? (params.status as TodoStatus)
      : undefined;

  const initial = await getTodos({
    page,
    limit: LIMIT,
    search: search || undefined,
    status: statusFilter,
  });

  return (
    <AppShell>
      <main className="px-4 pb-8 pt-4 sm:px-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Todo
          </h1>
          <p className="mt-2 text-foreground/70">
            Add tasks, set status (pending, cancel, completed, archived), and search with pagination.
          </p>
          <TodoPageClient
            initial={initial}
            currentPage={page}
            search={search}
            statusFilter={statusFilter ?? ""}
          />
        </div>
      </main>
    </AppShell>
  );
}
