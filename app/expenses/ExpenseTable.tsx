"use client";

import { useState, useEffect } from "react";
import type { Expense } from "@/types/expense";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@/components/ui/table";

type ExpenseTableProps = {
  expenses: Expense[];
  onUpdated: () => void;
};

function formatAmount(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ExpenseTable({
  expenses,
  onUpdated,
}: ExpenseTableProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="relative max-w-full overflow-auto rounded-md border border-border bg-background">
        <div className="min-h-[120px] animate-pulse bg-muted/30" aria-hidden />
      </div>
    );
  }

  const emptyMessage = (
    <p className="py-8 text-center text-muted-foreground">
      No expenses yet. Add one above.
    </p>
  );

  return (
    <>
      <div className="min-w-0 space-y-3 md:hidden">
        {expenses.length === 0 ? (
          emptyMessage
        ) : (
          expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} onUpdated={onUpdated} />
          ))
        )}
      </div>

      <div className="relative hidden min-w-0 max-w-full overflow-auto rounded-md border border-border bg-background md:block">
        <Table aria-label="Expense list">
          <TableHeader>
            <Column>Amount</Column>
            <Column>Date</Column>
            <Column>Category</Column>
            <Column>Note</Column>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <Row>
                <Cell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No expenses yet. Add one above.
                </Cell>
              </Row>
            ) : (
              expenses.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} onUpdated={onUpdated} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function ExpenseRow({
  expense,
  onUpdated,
}: {
  expense: Expense;
  onUpdated: () => void;
}) {
  return (
    <Row>
      <Cell className="font-medium">{formatAmount(expense.amountCents)}</Cell>
      <Cell className="text-muted-foreground">
        {formatDate(expense.date)}
      </Cell>
      <Cell className="text-muted-foreground">
        {expense.category ?? "—"}
      </Cell>
      <Cell className="min-w-0 max-w-[200px] truncate text-muted-foreground">
        {expense.note ?? "—"}
      </Cell>
    </Row>
  );
}

function ExpenseCard({
  expense,
  onUpdated,
}: {
  expense: Expense;
  onUpdated: () => void;
}) {
  return (
    <article
      className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm"
      aria-label={`Expense: ${formatAmount(expense.amountCents)}`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p className="font-medium text-foreground">
          {formatAmount(expense.amountCents)}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDate(expense.date)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        {expense.category && (
          <span>{expense.category}</span>
        )}
        {expense.note && (
          <span className="min-w-0 truncate">{expense.note}</span>
        )}
      </div>
    </article>
  );
}
