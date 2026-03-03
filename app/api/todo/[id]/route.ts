import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Todo, TodoStatus } from "@/types/todo";

type RouteParams = { params: Promise<{ id: string }> };

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
    return NextResponse.json({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      status: (todo.status ?? "pending") as TodoStatus,
      createdAt: todo.createdAt,
    });
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
    const data: { title?: string; completed?: boolean; status?: string } = {};
    if (title !== undefined) data.title = title;
    if (completed !== undefined) data.completed = completed;
    if (status !== undefined) data.status = status;
    if (Object.keys(data).length === 0) {
      const existing = await prisma.todo.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Todo not found" }, { status: 404 });
      }
      return NextResponse.json({
        id: existing.id,
        title: existing.title,
        completed: existing.completed,
        status: (existing.status ?? "pending") as TodoStatus,
        createdAt: existing.createdAt,
      });
    }
    const todo = await prisma.todo.update({
      where: { id },
      data,
    });
    return NextResponse.json({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      status: (todo.status ?? "pending") as TodoStatus,
      createdAt: todo.createdAt,
    });
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
