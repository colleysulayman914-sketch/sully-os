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
