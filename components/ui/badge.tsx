"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-muted text-muted-foreground border border-border",
        destructive: "bg-destructive/10 text-destructive border border-destructive/20",
        overdue: "bg-destructive/10 text-destructive border border-destructive/20",
        completed: "bg-primary/10 text-primary border border-primary/20",
        archived: "bg-muted text-muted-foreground border border-border",
        pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        cancel: "bg-muted text-muted-foreground border border-border",
        priorityLow: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20",
        priorityMedium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
        priorityHigh: "bg-destructive/10 text-destructive border border-destructive/20",
        repeat: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20",
        category: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
        paymentMethod: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20",
        earningCategory: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
