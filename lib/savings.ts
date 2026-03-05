import { prisma } from "@/lib/db";
import type { SavingsCategorySummary, SavingsSummary } from "@/types/savings";
import { DEFAULT_SAVINGS_CATEGORIES } from "@/types/savings";

/** Ensures default categories exist. Call before reading categories. */
export async function ensureDefaultSavingsCategories(): Promise<void> {
  const count = await prisma.savingsCategory.count();
  if (count > 0) return;
  await prisma.savingsCategory.createMany({
    data: DEFAULT_SAVINGS_CATEGORIES.map((name) => ({ name })),
  });
}

export async function getSavingsSummary(): Promise<SavingsSummary> {
  await ensureDefaultSavingsCategories();

  const [categoryRows, depositsByCategory, goals] = await Promise.all([
    prisma.savingsCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.savingsDeposit.groupBy({
      by: ["category"],
      _sum: { amountCents: true },
    }),
    prisma.savingsGoal.findMany(),
  ]);

  const goalByCategory = new Map(
    goals.map((g) => [g.category, g.targetAmountCents])
  );

  const categories: SavingsCategorySummary[] = categoryRows.map((row) => ({
    category: row.name,
    totalCents:
      depositsByCategory.find((d) => d.category === row.name)?._sum
        ?.amountCents ?? 0,
    goalCents: goalByCategory.get(row.name) ?? null,
  }));

  return { categories };
}

/** Total savings (deposits) in cents for a given month (defaults to current month). */
export async function getTotalMonthlySavings(
  year?: number,
  month?: number
): Promise<number> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  const result = await prisma.savingsDeposit.aggregate({
    where: { date: { gte: start, lte: end } },
    _sum: { amountCents: true },
  });
  return result._sum.amountCents ?? 0;
}

export async function getSavingsCategoryNames(): Promise<string[]> {
  await ensureDefaultSavingsCategories();
  const rows = await prisma.savingsCategory.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return rows.map((r) => r.name);
}

export async function createSavingsCategory(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name is required");
  const existing = await prisma.savingsCategory.findUnique({
    where: { name: trimmed },
  });
  if (existing) throw new Error("Category already exists");
  await prisma.savingsCategory.create({ data: { name: trimmed } });
}

export async function createSavingsDeposit(data: {
  amountCents: number;
  date: Date;
  note: string | null;
  category: string;
}): Promise<void> {
  const cat = await prisma.savingsCategory.findUnique({
    where: { name: data.category },
  });
  if (!cat) throw new Error("Invalid savings category");
  await prisma.savingsDeposit.create({
    data: {
      amountCents: data.amountCents,
      date: data.date,
      note: data.note,
      category: data.category,
    },
  });
}

export async function setSavingsGoal(
  category: string,
  targetAmountCents: number
): Promise<void> {
  const cat = await prisma.savingsCategory.findUnique({
    where: { name: category },
  });
  if (!cat) throw new Error("Invalid savings category");
  await prisma.savingsGoal.upsert({
    where: { category },
    create: { category, targetAmountCents },
    update: { targetAmountCents },
  });
}

export async function removeSavingsGoal(category: string): Promise<void> {
  await prisma.savingsGoal.deleteMany({ where: { category } });
}

export async function deleteSavingsCategory(id: string): Promise<void> {
  const row = await prisma.savingsCategory.findUnique({ where: { id } });
  if (!row) throw new Error("Category not found");
  const [depositCount, goalCount] = await Promise.all([
    prisma.savingsDeposit.count({ where: { category: row.name } }),
    prisma.savingsGoal.count({ where: { category: row.name } }),
  ]);
  if (depositCount > 0 || goalCount > 0) {
    throw new Error(
      "Cannot delete category that has deposits or a goal. Remove them first."
    );
  }
  await prisma.savingsCategory.delete({ where: { id } });
}
