export const TODO_STATUSES = ["pending", "cancel", "completed", "archived"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export const TODO_PRIORITIES = ["low", "medium", "high"] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];

export const TODO_REPEAT_RULES = ["none", "daily", "weekly", "monthly", "yearly", "custom"] as const;
export type TodoRepeatRule = (typeof TODO_REPEAT_RULES)[number];

export const TODO_REPEAT_UNITS = ["day", "week", "month"] as const;
export type TodoRepeatUnit = (typeof TODO_REPEAT_UNITS)[number];

/** Display-only status: "overdue" when due date is past and task not completed/archived */
export type DisplayStatus = TodoStatus | "overdue";

export function getDisplayStatus(todo: { status: TodoStatus; dueDate: Date | null }): DisplayStatus {
  if (todo.status === "completed" || todo.status === "archived") return todo.status;
  if (todo.dueDate) {
    const due = new Date(todo.dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (due < today) return "overdue";
  }
  return todo.status;
}

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  status: TodoStatus;
  priority: TodoPriority | null;
  dueDate: Date | null;
  repeatRule: TodoRepeatRule | null;
  repeatInterval: number | null;
  repeatUnit: TodoRepeatUnit | null;
  createdAt: Date;
};

export type CreateTodoInput = {
  title: string;
  status?: TodoStatus;
  priority?: TodoPriority | null;
  dueDate?: string | null; // ISO date string or datetime-local YYYY-MM-DDTHH:mm
  repeatRule?: TodoRepeatRule | null;
  repeatInterval?: number | null;
  repeatUnit?: TodoRepeatUnit | null;
};

export type UpdateTodoInput = {
  title?: string;
  completed?: boolean;
  status?: TodoStatus;
  priority?: TodoPriority | null;
  dueDate?: string | null;
  repeatRule?: TodoRepeatRule | null;
  repeatInterval?: number | null;
  repeatUnit?: TodoRepeatUnit | null;
};

export type TodoListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TodoStatus;
};

export type TodoListResponse = {
  todos: Todo[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};
