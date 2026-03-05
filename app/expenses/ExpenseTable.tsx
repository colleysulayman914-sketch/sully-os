"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import type { Expense } from "@/types/expense";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Banknote,
  Calendar,
  CreditCard,
  FileText,
  MoreVertical,
  Pencil,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ExpenseCategory, ExpensePaymentMethod } from "@/types/expense";
import EditExpenseModal from "./EditExpenseModal";

function CategoryTag({ category }: { category: ExpenseCategory | null }) {
  if (!category) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="category">
      {category}
    </Badge>
  );
}

function PaymentMethodTag({ method }: { method: ExpensePaymentMethod | null }) {
  if (!method) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="paymentMethod">
      {method}
    </Badge>
  );
}

type ExpenseTableProps = {
  expenses: Expense[];
  onUpdated: () => void;
};

function formatAmount(cents: number): string {
  return new Intl.NumberFormat("en-GM", {
    style: "currency",
    currency: "GMD",
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
            <Column isRowHeader>
              <span className="flex items-center gap-1.5">
                <Banknote className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Amount
              </span>
            </Column>
            <Column>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Date
              </span>
            </Column>
            <Column>
              <span className="flex items-center gap-1.5">
                <Tag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Category
              </span>
            </Column>
            <Column>
              <span className="flex items-center gap-1.5">
                <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                To whom
              </span>
            </Column>
            <Column>
              <span className="flex items-center gap-1.5">
                <CreditCard className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Payment
              </span>
            </Column>
            <Column>
              <span className="flex items-center gap-1.5">
                <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                Note
              </span>
            </Column>
            <Column width={56}>Actions</Column>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <Row>
                <Cell colSpan={7} className="h-24 text-center text-muted-foreground">
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

const menuItemClass =
  "flex w-full min-h-[44px] items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50";

function useExpenseActions(expense: Expense, onUpdated: () => void) {
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDelete = useCallback(() => {
    setLoading(true);
    fetch(`/api/expense/${expense.id}`, { method: "DELETE" })
      .then(async (res) => {
        if (res.ok) {
          toast.success("Expense deleted");
          setDeleteConfirmOpen(false);
          onUpdated();
        } else {
          const data = await res.json();
          toast.error(data?.error ?? "Failed to delete");
        }
      })
      .catch(() => toast.error("Failed to delete"))
      .finally(() => setLoading(false));
  }, [expense.id, onUpdated]);

  return {
    loading,
    editModalOpen,
    setEditModalOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleDelete,
  };
}

function ExpenseActionsMenu({
  expense,
  actions,
  onUpdated,
}: {
  expense: Expense;
  actions: ReturnType<typeof useExpenseActions>;
  onUpdated: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      setMenuPosition(null);
      return;
    }
    const btn = triggerRef.current?.querySelector("button");
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="relative flex justify-end" ref={triggerRef}>
      <Button
        variant="ghost"
        size="icon"
        onPress={() => setMenuOpen((o) => !o)}
        isDisabled={actions.loading}
        aria-label="More actions"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className="min-h-[44px] min-w-[44px]"
      >
        <MoreVertical className="size-5" />
      </Button>
      {menuOpen &&
        menuPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 min-w-[160px] rounded-md border border-border bg-background py-1 shadow-lg"
            style={{ top: menuPosition.top, right: menuPosition.right }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                actions.setEditModalOpen(true);
              }}
              disabled={actions.loading}
              className={menuItemClass}
            >
              <Pencil className="size-4 shrink-0" />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                actions.setDeleteConfirmOpen(true);
              }}
              disabled={actions.loading}
              className={`${menuItemClass} text-destructive hover:text-destructive`}
            >
              <Trash2 className="size-4 shrink-0" />
              Delete
            </button>
          </div>,
          document.body
        )}
      {actions.editModalOpen && (
        <EditExpenseModal
          expense={expense}
          onClose={() => actions.setEditModalOpen(false)}
          onSaved={onUpdated}
        />
      )}
      <Dialog open={actions.deleteConfirmOpen} onOpenChange={actions.setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Delete expense?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This expense will be permanently deleted. This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={() => actions.setDeleteConfirmOpen(false)}
              className="min-h-[44px] min-w-[44px] rounded-lg border border-border bg-background px-4 py-3 text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={actions.handleDelete}
              disabled={actions.loading}
              className="min-h-[44px] min-w-[44px] rounded-lg bg-destructive px-4 py-3 text-destructive-foreground hover:opacity-90 disabled:opacity-50"
            >
              {actions.loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExpenseRow({
  expense,
  onUpdated,
}: {
  expense: Expense;
  onUpdated: () => void;
}) {
  const actions = useExpenseActions(expense, onUpdated);

  return (
    <Row>
      <Cell className="font-medium">{formatAmount(expense.amountCents)}</Cell>
      <Cell className="text-muted-foreground">
        {formatDate(expense.date)}
      </Cell>
      <Cell>
        <CategoryTag category={expense.category} />
      </Cell>
      <Cell className="min-w-0 max-w-[140px] truncate text-muted-foreground">
        {expense.toWhom ?? "—"}
      </Cell>
      <Cell>
        <PaymentMethodTag method={expense.paymentMethod} />
      </Cell>
      <Cell className="min-w-0 max-w-[200px] truncate text-muted-foreground">
        {expense.note ?? "—"}
      </Cell>
      <Cell>
        <ExpenseActionsMenu expense={expense} actions={actions} onUpdated={onUpdated} />
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
  const actions = useExpenseActions(expense, onUpdated);

  return (
    <article
      className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm"
      aria-label={`Expense: ${formatAmount(expense.amountCents)}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Banknote className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">
            {formatAmount(expense.amountCents)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0" aria-hidden />
              {formatDate(expense.date)}
            </span>
            {expense.category && (
              <span className="flex items-center gap-1.5">
                <Tag className="size-4 shrink-0" aria-hidden />
                <CategoryTag category={expense.category} />
              </span>
            )}
            {expense.toWhom && (
              <span className="flex items-center gap-1.5 min-w-0 truncate">
                <User className="size-4 shrink-0" aria-hidden />
                {expense.toWhom}
              </span>
            )}
            {expense.paymentMethod && (
              <span className="flex items-center gap-1.5">
                <CreditCard className="size-4 shrink-0" aria-hidden />
                <PaymentMethodTag method={expense.paymentMethod} />
              </span>
            )}
            {expense.note && (
              <span className="flex items-center gap-1.5 min-w-0 truncate">
                <FileText className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{expense.note}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => actions.setEditModalOpen(true)}
            isDisabled={actions.loading}
            aria-label="Edit expense"
            className="min-h-[44px] min-w-[44px]"
          >
            <Pencil className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => actions.setDeleteConfirmOpen(true)}
            isDisabled={actions.loading}
            aria-label="Delete expense"
            className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
          >
            <Trash2 className="size-5" />
          </Button>
        </div>
      </div>
      {actions.editModalOpen && (
        <EditExpenseModal
          expense={expense}
          onClose={() => actions.setEditModalOpen(false)}
          onSaved={onUpdated}
        />
      )}
      <Dialog open={actions.deleteConfirmOpen} onOpenChange={actions.setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Delete expense?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This expense will be permanently deleted. This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <button
              type="button"
              onClick={() => actions.setDeleteConfirmOpen(false)}
              className="min-h-[44px] min-w-[44px] rounded-lg border border-border bg-background px-4 py-3 text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={actions.handleDelete}
              disabled={actions.loading}
              className="min-h-[44px] min-w-[44px] rounded-lg bg-destructive px-4 py-3 text-destructive-foreground hover:opacity-90 disabled:opacity-50"
            >
              {actions.loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
