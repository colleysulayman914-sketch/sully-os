/** Default category names seeded when none exist. */
export const DEFAULT_SAVINGS_CATEGORIES = [
  "General saving",
  "Housing",
  "Marriage",
  "Others",
] as const;

export type SavingsDeposit = {
  id: string;
  amountCents: number;
  date: Date;
  note: string | null;
  category: string;
  createdAt: Date;
};

export type SavingsGoal = {
  id: string;
  category: string;
  targetAmountCents: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SavingsCategoryRecord = {
  id: string;
  name: string;
  createdAt: Date;
};

export type SavingsCategorySummary = {
  category: string;
  totalCents: number;
  goalCents: number | null;
};

export type SavingsSummary = {
  categories: SavingsCategorySummary[];
};

export type CreateSavingsDepositInput = {
  amountCents: number;
  date: string;
  note?: string | null;
  category: string;
};

export type SetSavingsGoalInput = {
  category: string;
  targetAmountCents: number;
};
