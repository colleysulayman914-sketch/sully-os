"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WheelPaginationProps {
  totalPages?: number;
  className?: string;
  visibleCount?: number;
  /** 0-based current page (controlled) */
  value?: number;
  onChange?: (page: number) => void;
}

export default function WheelPagination({
  totalPages = 1,
  visibleCount = 5,
  value,
  className,
  onChange,
}: WheelPaginationProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(value ?? 0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value !== undefined) setActive(value);
  }, [value]);

  const prevPage = () => {
    const next = Math.max(active - 1, 0);
    setActive(next);
    onChange?.(next);
  };
  const nextPage = () => {
    const maxPage = Math.max(0, totalPages - 1);
    const next = Math.min(active + 1, maxPage);
    setActive(next);
    onChange?.(next);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) setActive((p) => Math.max(p - 1, 0));
    else if (e.deltaY > 0) setActive((p) => Math.min(p + 1, totalPages - 1));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxPage = Math.max(0, totalPages - 1);
    if (totalPages <= 0) return [0];
    const half = Math.floor(visibleCount / 2);
    let start = active - half;
    let end = active + half;
    if (start < 0) {
      end += -start;
      start = 0;
    }
    if (end > maxPage) {
      start -= end - maxPage;
      end = maxPage;
      if (start < 0) start = 0;
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-4 min-h-[52px]",
          className
        )}
        aria-hidden
      >
        <div className="min-h-[44px] min-w-[44px] rounded-md bg-muted/30" />
        <div className="flex gap-1">
          {Array.from({ length: Math.min(visibleCount, totalPages || 1) }).map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-muted/30" />
          ))}
        </div>
        <div className="min-h-[44px] min-w-[44px] rounded-md bg-muted/30" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center gap-2 p-4 select-none cursor-pointer",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onPress={prevPage}
        isDisabled={active === 0}
        className="text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors min-h-[44px] min-w-[44px]"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-1">
        {visiblePages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setActive(p);
              onChange?.(p);
            }}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full"
            aria-label={`Page ${p + 1}`}
            aria-current={active === p ? "page" : undefined}
          >
            <motion.span
              layout
              animate={{ scale: active === p ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
                active === p
                  ? "bg-primary text-primary-foreground border border-primary"
                  : "bg-muted text-muted-foreground border border-border"
              )}
            >
              {p + 1}
            </motion.span>
          </button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onPress={nextPage}
        isDisabled={totalPages <= 1 || active >= totalPages - 1}
        className="text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors min-h-[44px] min-w-[44px]"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
