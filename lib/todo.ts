import { prisma } from "@/lib/db";
import type { Todo, TodoListParams, TodoListResponse, TodoPriority, TodoRepeatRule, TodoRepeatUnit, TodoStatus } from "@/types/todo";

const STATUSES: TodoStatus[] = ["pending", "cancel", "completed", "archived"];
const PRIORITIES: TodoPriority[] = ["low", "medium", "high"];
const REPEAT_RULES: TodoRepeatRule[] = ["none", "daily", "weekly", "monthly", "yearly", "custom"];
const REPEAT_UNITS: TodoRepeatUnit[] = ["day", "week", "month"];

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

  const todos: Todo[] = rows.map((t) => {
    const rule = t.repeatRule && REPEAT_RULES.includes(t.repeatRule as TodoRepeatRule) ? (t.repeatRule as TodoRepeatRule) : null;
    const unit = t.repeatUnit && REPEAT_UNITS.includes(t.repeatUnit as TodoRepeatUnit) ? (t.repeatUnit as TodoRepeatUnit) : null;
    const interval = rule === "custom" && typeof t.repeatInterval === "number" && t.repeatInterval >= 1 ? t.repeatInterval : null;
    return {
      id: t.id,
      title: t.title,
      completed: t.completed,
      status: (t.status ?? "pending") as TodoStatus,
      priority: t.priority && PRIORITIES.includes(t.priority as TodoPriority) ? (t.priority as TodoPriority) : null,
      dueDate: t.dueDate,
      repeatRule: rule,
      repeatInterval: rule === "custom" ? interval : null,
      repeatUnit: rule === "custom" ? unit : null,
      createdAt: t.createdAt,
    };
  });

  return {
    todos,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    page,
    limit,
  };
}
