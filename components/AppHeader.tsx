"use client";

import { Menu } from "lucide-react";

type AppHeaderProps = { onMenuClick?: () => void };

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 flex min-h-[44px] w-full items-center justify-between gap-2 border-b border-foreground/10 bg-background px-4 py-3 sm:justify-end sm:px-6"
      role="banner"
    >
      {onMenuClick ? (
        <button
          type="button"
          onClick={onMenuClick}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-foreground/80 hover:bg-foreground/5 active:bg-foreground/10 sm:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" aria-hidden />
        </button>
      ) : null}
      <div className="flex flex-shrink-0 items-center gap-x-3">
        <div className="hidden min-w-0 text-right sm:block">
          <span className="block truncate text-sm font-semibold text-foreground">
            Sulayman Colley
          </span>
          <span className="block truncate text-xs text-foreground/60">colleysulayma914@gmail.com</span>
        </div>
        <div className="flex items-center gap-x-2 rounded-lg py-2 pl-2 pr-1 min-h-[44px]">
          <img
            src="/Profile.jpeg"
            className="h-9 w-9 rounded-full object-cover"
            alt="User avatar"
          />
        </div>
      </div>
    </header>
  );
}
