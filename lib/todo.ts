import { prisma } from "@/lib/db";
import type { Todo, TodoListParams, TodoListResponse, TodoStatus } from "@/types/todo";

const STATUSES: TodoStatus[] = ["pending", "cancel", "completed", "archived"];

export async function getTodos(params: TodoListParams = {}): Promise<TodoListResponse> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const search = (params.search ?? "").trim();
  const statusFilter = params.status && STATUSES.includes(params.status) ? params.status : undefined;

  const where: { status?: string; title?: { contains: string; mode: "insensitive" } } = {};
  if (statusFilter) where.status = statusFilter;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [rows, total] = await Promise.all([
    prisma.todo.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.todo.count({ where }),
  ]);

  const todos: Todo[] = rows.map((t) => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    status: (t.status ?? "pending") as TodoStatus,
    createdAt: t.createdAt,
  }));

  return {
    todos,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    page,
    limit,
  };
}
