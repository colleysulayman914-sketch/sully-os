"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/sidebar-with-submenu";
import AppHeader from "@/components/AppHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

type AppShellProps = { children: React.ReactNode };

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay: close sidebar when tapping outside */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 z-20 bg-foreground/20 sm:hidden transition-opacity duration-200"
        style={{
          pointerEvents: sidebarOpen ? "auto" : "none",
          opacity: sidebarOpen ? 1 : 0,
        }}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="relative min-h-screen w-full pb-20 sm:pb-0 sm:pl-80">
        <AppHeader onMenuClick={undefined} />
        {children}
      </div>
      <MobileBottomNav />
    </div>
  );
}
