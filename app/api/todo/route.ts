import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Todo, TodoListResponse, TodoPriority, TodoStatus } from "@/types/todo";

const STATUSES: TodoStatus[] = ["pending", "cancel", "completed", "archived"];
const PRIORITIES: TodoPriority[] = ["low", "medium", "high"];

function parseQuery(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10));
  const search = (searchParams.get("search") ?? "").trim();
  const status = searchParams.get("status") ?? "";
  const statusFilter = STATUSES.includes(status as TodoStatus) ? (status as TodoStatus) : undefined;
  return { page, limit, search, statusFilter };
}

export async function GET(
  request: Request
): Promise<NextResponse<TodoListResponse | { error: string }>> {
  try {
    const { page, limit, search, statusFilter } = parseQuery(request);
    const skip = (page - 1) * limit;

    const where: { status?: string; title?: { contains: string; mode: "insensitive" } } = {};
    if (statusFilter) where.status = statusFilter;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.todo.count({ where }),
    ]);

    const mapped = todos.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      status: (t.status ?? "pending") as TodoStatus,
      priority: t.priority && PRIORITIES.includes(t.priority as TodoPriority) ? (t.priority as TodoPriority) : null,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
    }));

    const totalPages = Math.ceil(total / limit) || 1;
    const body: TodoListResponse = {
      todos: mapped,
      total,
      totalPages,
      page,
      limit,
    };
    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<Todo | { error: string }>> {
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
    const status = STATUSES.includes(body?.status) ? body.status : "pending";
    const priority = body?.priority != null && body.priority !== "" && PRIORITIES.includes(body.priority)
      ? body.priority
      : null;
    const dueDate =
      body?.dueDate != null && body.dueDate !== ""
        ? new Date(body.dueDate)
        : undefined;
    const todo = await prisma.todo.create({
      data: { title, status, priority, dueDate: dueDate ?? null },
    });
    const mapped: Todo = {
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      status: (todo.status ?? "pending") as TodoStatus,
      priority: todo.priority && PRIORITIES.includes(todo.priority as TodoPriority) ? (todo.priority as TodoPriority) : null,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
    };
    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
