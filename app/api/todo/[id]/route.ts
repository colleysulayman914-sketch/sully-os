import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Todo, TodoPriority, TodoStatus } from "@/types/todo";

const PRIORITIES: TodoPriority[] = ["low", "medium", "high"];

type RouteParams = { params: Promise<{ id: string }> };

/** Prisma Todo may omit optional fields in generated types; use this when reading dueDate/priority */
function toTodo(
  row: {
    id: string;
    title: string;
    completed: boolean;
    status: string | null;
    createdAt: Date;
    dueDate?: Date | null;
    priority?: string | null;
  }
): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    status: (row.status ?? "pending") as TodoStatus,
    priority: row.priority && PRIORITIES.includes(row.priority as TodoPriority) ? (row.priority as TodoPriority) : null,
    dueDate: row.dueDate ?? null,
    createdAt: row.createdAt,
  };
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<Todo | { error: string }>> {
  try {
    const { id } = await params;
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }
    return NextResponse.json(toTodo(todo));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch todo" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<Todo | { error: string }>> {
  try {
    const { id } = await params;
    const body = await request.json();
    const title =
      body?.title !== undefined
        ? typeof body.title === "string"
          ? body.title.trim()
          : ""
        : undefined;
    const completed =
      typeof body?.completed === "boolean" ? body.completed : undefined;
    const status = typeof body?.status === "string" && ["pending", "cancel", "completed", "archived"].includes(body.status)
      ? body.status
      : undefined;
    const dueDate =
      body?.dueDate !== undefined
        ? body.dueDate === null || body.dueDate === ""
          ? null
          : new Date(body.dueDate)
        : undefined;
    const priority =
      body?.priority !== undefined
        ? body.priority === null || body.priority === ""
          ? null
          : typeof body.priority === "string" && PRIORITIES.includes(body.priority as TodoPriority)
            ? body.priority
            : undefined;
    const data: { title?: string; completed?: boolean; status?: string; priority?: string | null; dueDate?: Date | null } = {};
    if (title !== undefined) data.title = title;
    if (completed !== undefined) data.completed = completed;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate;
    if (Object.keys(data).length === 0) {
      const existing = await prisma.todo.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Todo not found" }, { status: 404 });
      }
      return NextResponse.json(toTodo(existing));
    }
    const todo = await prisma.todo.update({
      where: { id },
      data,
    });
    return NextResponse.json(toTodo(todo));
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<{ success: true } | { error: string }>> {
  try {
    const { id } = await params;
    await prisma.todo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
