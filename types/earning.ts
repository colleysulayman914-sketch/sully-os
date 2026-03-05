import type { ExpensePaymentMethod } from "@/types/expense";
import { PAYMENT_METHODS } from "@/types/expense";

export const EARNING_CATEGORIES = [
  "Salaries",
  "Side Project",
  "Friends & Family",
  "Other",
] as const;

export type EarningCategory = (typeof EARNING_CATEGORIES)[number];

export type Earning = {
  id: string;
  amountCents: number;
  date: Date;
  note: string | null;
  category: EarningCategory | null;
  fromWhom: string | null;
  paymentMethod: ExpensePaymentMethod | null;
  createdAt: Date;
};

export type CreateEarningInput = {
  amountCents: number;
  date: string;
  note?: string | null;
  category?: EarningCategory | null;
  fromWhom?: string | null;
  paymentMethod?: ExpensePaymentMethod | null;
};

export type UpdateEarningInput = {
  amountCents?: number;
  date?: string;
  note?: string | null;
  category?: EarningCategory | null;
  fromWhom?: string | null;
  paymentMethod?: ExpensePaymentMethod | null;
};

export type EarningListParams = {
  page?: number;
  limit?: number;
  category?: EarningCategory;
  dateFrom?: string;
  dateTo?: string;
};

export type EarningListResponse = {
  earnings: Earning[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

export { PAYMENT_METHODS };
export type { ExpensePaymentMethod };
