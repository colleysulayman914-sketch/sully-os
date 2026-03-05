export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Giveaways",
  "Parent Allowances",
  "School Transportation",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const PAYMENT_METHODS = [
  "Mobile Money",
  "Cash",
  "Bank Transfer",
  "Card",
  "Other",
] as const;

export type ExpensePaymentMethod = (typeof PAYMENT_METHODS)[number];

export type Expense = {
  id: string;
  amountCents: number;
  date: Date;
  note: string | null;
  category: ExpenseCategory | null;
  toWhom: string | null;
  paymentMethod: ExpensePaymentMethod | null;
  createdAt: Date;
};

export type CreateExpenseInput = {
  amountCents: number;
  date: string;
  note?: string | null;
  category?: ExpenseCategory | null;
  toWhom?: string | null;
  paymentMethod?: ExpensePaymentMethod | null;
};

export type UpdateExpenseInput = {
  amountCents?: number;
  date?: string;
  note?: string | null;
  category?: ExpenseCategory | null;
  toWhom?: string | null;
  paymentMethod?: ExpensePaymentMethod | null;
};

export type ExpenseListParams = {
  page?: number;
  limit?: number;
  category?: ExpenseCategory;
  dateFrom?: string; // ISO date
  dateTo?: string;   // ISO date
};

export type ExpenseListResponse = {
  expenses: Expense[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};
