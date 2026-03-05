"use client";

import { Menu, Bell } from "lucide-react";

type AppHeaderProps = { onMenuClick?: () => void };

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning!";
  if (hour < 17) return "Good Afternoon!";
  return "Good Evening!";
}

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 flex min-h-[44px] w-full items-center justify-between gap-2 border-b border-foreground/10 bg-background px-4 py-3 sm:justify-end sm:px-6"
      role="banner"
    >
      {/* Mobile: hamburger + greeting & name on left */}
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
      <div className="flex min-w-0 flex-1 flex-col justify-center sm:hidden">
        <span className="truncate text-sm font-medium text-foreground/80">
          {getGreeting()}
        </span>
        <span className="truncate text-sm font-semibold text-foreground">
          Sulayman Colley
        </span>
      </div>
      {/* Desktop: name + email; Mobile: bell + avatar */}
      <div className="flex flex-shrink-0 items-center gap-x-1 sm:gap-x-3">
        <div className="hidden min-w-0 text-right sm:block">
          <span className="block truncate text-sm font-semibold text-foreground">
            Sulayman Colley
          </span>
          <span className="block truncate text-xs text-foreground/60">
            colleysulayma914@gmail.com
          </span>
        </div>
        <button
          type="button"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-foreground/80 hover:bg-foreground/5 active:bg-foreground/10 sm:hidden"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden />
        </button>
        <div className="flex items-center rounded-lg py-2 pl-2 pr-1 min-h-[44px] min-w-[44px] justify-center sm:min-w-0 sm:justify-end">
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
