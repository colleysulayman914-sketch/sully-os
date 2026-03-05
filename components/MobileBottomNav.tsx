"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowDownCircle,
  Plus,
  ArrowUpCircle,
  ListTodo,
  CircleDollarSign,
  ListChecks,
  PiggyBank,
} from "lucide-react";

async function fetchPendingTodoCount(): Promise<number> {
  try {
    const res = await fetch("/api/todo?status=pending&limit=1");
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.total === "number" ? data.total : 0;
  } catch {
    return 0;
  }
}

const navItems: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/", label: "Overview", icon: <Home className="size-5 shrink-0" aria-hidden /> },
  { href: "/expenses", label: "Expenses", icon: <ArrowDownCircle className="size-5 shrink-0" aria-hidden /> },
  { href: "/earnings", label: "Earnings", icon: <ArrowUpCircle className="size-5 shrink-0" aria-hidden /> },
  { href: "/todo", label: "Todo", icon: <ListTodo className="size-5 shrink-0" aria-hidden /> },
];

const addMenuItems: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/expenses?openAdd=1", label: "Add expense", icon: <CircleDollarSign className="size-4 shrink-0" aria-hidden /> },
  { href: "/earnings?openAdd=1", label: "Add earning", icon: <ArrowUpCircle className="size-4 shrink-0" aria-hidden /> },
  { href: "/savings?openAdd=1", label: "Add deposit", icon: <PiggyBank className="size-4 shrink-0" aria-hidden /> },
  { href: "/todo?openAdd=1", label: "Add todo", icon: <ListChecks className="size-4 shrink-0" aria-hidden /> },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const basePath = "/" + (pathname?.split("/").filter(Boolean)[0] ?? "");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!addMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [addMenuOpen]);

  useEffect(() => {
    let cancelled = false;
    fetchPendingTodoCount().then((n) => {
      if (!cancelled) setPendingCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex sm:hidden items-center justify-around border-t border-border bg-background px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Mobile navigation"
    >
      <Link
        href="/"
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg text-foreground/70 hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10 aria-[current]:text-foreground"
        aria-current={basePath === "/" ? "page" : undefined}
      >
        {navItems[0].icon}
        <span className="text-[10px] font-medium">{navItems[0].label}</span>
      </Link>

      <Link
        href="/expenses"
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg text-foreground/70 hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10 aria-[current]:text-foreground"
        aria-current={basePath === "/expenses" ? "page" : undefined}
      >
        {navItems[1].icon}
        <span className="text-[10px] font-medium">{navItems[1].label}</span>
      </Link>

      <div className="relative flex flex-col items-center" ref={menuRef}>
        <button
          type="button"
          onClick={() => setAddMenuOpen((o) => !o)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-foreground text-background shadow-md hover:opacity-90 active:opacity-95 -mt-4"
          aria-label="Add"
          aria-expanded={addMenuOpen}
          aria-haspopup="true"
        >
          <Plus className="size-6 shrink-0" aria-hidden />
        </button>
        {addMenuOpen && (
          <div
            className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col gap-0.5 rounded-lg border border-border bg-background py-1 shadow-lg min-w-[160px]"
            role="menu"
          >
            {addMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAddMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-foreground/5"
                role="menuitem"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/earnings"
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg text-foreground/70 hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10 aria-[current]:text-foreground"
        aria-current={basePath === "/earnings" ? "page" : undefined}
      >
        {navItems[2].icon}
        <span className="text-[10px] font-medium">{navItems[2].label}</span>
      </Link>

      <Link
        href="/todo"
        className="relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg text-foreground/70 hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10 aria-[current]:text-foreground"
        aria-current={basePath === "/todo" ? "page" : undefined}
        aria-label={pendingCount > 0 ? `Todo, ${pendingCount} pending` : "Todo"}
      >
        {navItems[3].icon}
        {pendingCount > 0 && (
          <span
            className="absolute right-0 top-0 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
            aria-hidden
          >
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
        <span className="text-[10px] font-medium">{navItems[3].label}</span>
      </Link>
    </nav>
  );
}
