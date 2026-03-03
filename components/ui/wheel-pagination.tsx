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
  const [active, setActive] = useState(value ?? 0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) setActive(value);
  }, [value]);

  const prevPage = () => {
    const next = Math.max(active - 1, 0);
    setActive(next);
    onChange?.(next);
  };
  const nextPage = () => {
    const next = Math.min(active + 1, totalPages - 1);
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
    const half = Math.floor(visibleCount / 2);
    let start = active - half;
    let end = active + half;
    if (start < 0) {
      end += -start;
      start = 0;
    }
    if (end > totalPages - 1) {
      start -= end - (totalPages - 1);
      end = totalPages - 1;
      if (start < 0) start = 0;
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

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
      <div className="flex gap-2">
        {visiblePages.map((p) => (
          <motion.div
            key={p}
            layout
            animate={{ scale: active === p ? 1.3 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full font-medium",
              active === p
                ? "bg-primary text-primary-foreground border border-primary"
                : "bg-muted text-muted-foreground border border-border"
            )}
            onClick={() => {
              setActive(p);
              onChange?.(p);
            }}
          >
            {p + 1}
          </motion.div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onPress={nextPage}
        isDisabled={active === totalPages - 1}
        className="text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors min-h-[44px] min-w-[44px]"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
