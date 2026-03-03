import AppShell from "@/components/AppShell";
import { getTodos } from "@/lib/todo";
import TodoPageClient from "./TodoPageClient";

export const metadata = {
  title: "Todo",
};

export default async function TodoPage() {
  const initial = await getTodos({
    page: 1,
    limit: 5,
    search: "",
    status: undefined,
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
          <TodoPageClient initial={initial} />
        </div>
      </main>
    </AppShell>
  );
}
