export const TODO_STATUSES = ["pending", "cancel", "completed", "archived"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  status: TodoStatus;
  createdAt: Date;
};

export type CreateTodoInput = {
  title: string;
};

export type UpdateTodoInput = {
  title?: string;
  completed?: boolean;
  status?: TodoStatus;
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
