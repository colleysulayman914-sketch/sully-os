import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Todo, TodoPriority, TodoRepeatRule, TodoRepeatUnit, TodoStatus } from "@/types/todo";

const PRIORITIES: TodoPriority[] = ["low", "medium", "high"];
const REPEAT_RULES: TodoRepeatRule[] = ["none", "daily", "weekly", "monthly", "yearly", "custom"];
const REPEAT_UNITS: TodoRepeatUnit[] = ["day", "week", "month"];

type RouteParams = { params: Promise<{ id: string }> };

function mapRepeat(
  row: { repeatRule?: string | null; repeatInterval?: number | null; repeatUnit?: string | null }
): { repeatRule: TodoRepeatRule | null; repeatInterval: number | null; repeatUnit: TodoRepeatUnit | null } {
  const rule = row.repeatRule && REPEAT_RULES.includes(row.repeatRule as TodoRepeatRule) ? (row.repeatRule as TodoRepeatRule) : null;
  const unit = row.repeatUnit && REPEAT_UNITS.includes(row.repeatUnit as TodoRepeatUnit) ? (row.repeatUnit as TodoRepeatUnit) : null;
  const interval = rule === "custom" && typeof row.repeatInterval === "number" && row.repeatInterval >= 1 ? row.repeatInterval : null;
  return {
    repeatRule: rule,
    repeatInterval: rule === "custom" ? interval : null,
    repeatUnit: rule === "custom" ? unit : null,
  };
}

/** Prisma Todo may omit optional fields in generated types; use this when reading dueDate/priority/repeat */
function toTodo(
  row: {
    id: string;
    title: string;
    completed: boolean;
    status: string | null;
    createdAt: Date;
    dueDate?: Date | null;
    priority?: string | null;
    repeatRule?: string | null;
    repeatInterval?: number | null;
    repeatUnit?: string | null;
  }
): Todo {
  const repeat = mapRepeat(row);
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    status: (row.status ?? "pending") as TodoStatus,
    priority: row.priority && PRIORITIES.includes(row.priority as TodoPriority) ? (row.priority as TodoPriority) : null,
    dueDate: row.dueDate ?? null,
    ...repeat,
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
    let priority: string | null | undefined = undefined;
    if (body?.priority !== undefined) {
      if (body.priority === null || body.priority === "") {
        priority = null;
      } else if (typeof body.priority === "string" && PRIORITIES.includes(body.priority as TodoPriority)) {
        priority = body.priority;
      }
    }
    const rawRule = body?.repeatRule;
    let repeatRule: TodoRepeatRule | null | undefined = undefined;
    if (rawRule !== undefined) {
      if (rawRule === null || rawRule === "") {
        repeatRule = null;
      } else if (typeof rawRule === "string" && REPEAT_RULES.includes(rawRule as TodoRepeatRule)) {
        repeatRule = rawRule as TodoRepeatRule;
      }
    }
    let repeatInterval: number | null | undefined = undefined;
    let repeatUnit: TodoRepeatUnit | null | undefined = undefined;
    if (repeatRule !== undefined) {
      if (repeatRule === "custom") {
        const interval = typeof body?.repeatInterval === "number" ? body.repeatInterval : parseInt(String(body?.repeatInterval), 10);
        const unit = body?.repeatUnit;
        if (!Number.isNaN(interval) && interval >= 1 && unit && REPEAT_UNITS.includes(unit as TodoRepeatUnit)) {
          repeatInterval = interval;
          repeatUnit = unit as TodoRepeatUnit;
        } else {
          repeatInterval = null;
          repeatUnit = null;
        }
      } else {
        repeatInterval = null;
        repeatUnit = null;
      }
    }
    const data: {
      title?: string;
      completed?: boolean;
      status?: string;
      priority?: string | null;
      dueDate?: Date | null;
      repeatRule?: string | null;
      repeatInterval?: number | null;
      repeatUnit?: string | null;
    } = {};
    if (title !== undefined) data.title = title;
    if (completed !== undefined) data.completed = completed;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate;
    if (repeatRule !== undefined) data.repeatRule = repeatRule;
    if (repeatInterval !== undefined) data.repeatInterval = repeatInterval;
    if (repeatUnit !== undefined) data.repeatUnit = repeatUnit;
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
