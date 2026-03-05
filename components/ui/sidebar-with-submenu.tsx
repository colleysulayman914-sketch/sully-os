"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  ListTodo,
  Wallet,
  Calendar,
  PieChart,
  Target,
  HelpCircle,
  Settings,
  X,
} from "lucide-react";

type MenuItem = { name: string; href: string; icon?: React.ReactNode };

const Menu = ({
  children,
  items,
  onLinkClick,
}: {
  children: React.ReactNode;
  items: MenuItem[];
  onLinkClick?: () => void;
}) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="w-full flex items-center justify-between text-foreground/80 min-h-[44px] px-3 py-2 rounded-lg hover:bg-foreground/5 active:bg-foreground/10 duration-150"
        onClick={() => setIsOpened((v) => !v)}
        aria-expanded={isOpened}
        aria-controls="submenu"
      >
        <div className="flex items-center gap-x-2">{children}</div>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-foreground/60 duration-150 ${isOpened ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpened && (
        <ul id="submenu" className="mx-4 px-2 border-l border-foreground/10 text-sm font-medium">
          {items.map((item, idx) => (
            <li key={idx}>
              <Link
                href={item.href}
                onClick={onLinkClick}
                className="flex items-center gap-x-2 text-foreground/80 min-h-[44px] px-2 py-2 rounded-lg hover:bg-foreground/5 active:bg-foreground/10 duration-150"
              >
                {item.icon ? (
                  <span className="text-foreground/60 shrink-0">{item.icon}</span>
                ) : null}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navigation: MenuItem[] = [
    {
      href: "/",
      name: "Overview",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: "/expenses",
      name: "Expenses",
      icon: <ArrowDownCircle className="w-5 h-5" />,
    },
    {
      href: "/earnings",
      name: "Earnings",
      icon: <ArrowUpCircle className="w-5 h-5" />,
    },
    {
      href: "/todo",
      name: "Todo",
      icon: <ListTodo className="w-5 h-5" />,
    },
  ];

  const navsFooter: MenuItem[] = [
    {
      href: "/help",
      name: "Help",
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      href: "/settings",
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const budgetSubmenu: MenuItem[] = [
    { name: "Monthly budget", href: "/budget", icon: <Calendar className="w-4 h-4" /> },
    { name: "By category", href: "/budget/categories", icon: <PieChart className="w-4 h-4" /> },
    { name: "Goals", href: "/budget/goals", icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] border-r border-foreground/10 bg-background space-y-8 z-30 transition-transform duration-200 ease-out sm:translate-x-0 sm:w-80 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Main navigation"
      aria-hidden={typeof onClose === "function" ? !isOpen : undefined}
    >
      <div className="flex flex-col h-full px-4">
        <div className="flex h-20 shrink-0 items-center justify-between gap-2 py-2">
          <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-foreground/20 rounded-lg flex-1 min-w-0" onClick={onClose}>
            <Image
              src="/logo%20(3).png"
              alt="Expense Tracker"
              width={240}
              height={72}
              className="h-[72px] w-auto max-w-full object-contain"
              priority
            />
          </Link>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex shrink-0 items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-foreground/80 hover:bg-foreground/5 active:bg-foreground/10 sm:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="overflow-auto flex-1">
          <ul className="text-sm font-medium flex-1">
            {navigation.map((item, idx) => (
              <li key={idx}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-x-2 text-foreground/80 min-h-[44px] px-3 py-2 rounded-lg hover:bg-foreground/5 active:bg-foreground/10 duration-150"
                >
                  <span className="text-foreground/60 shrink-0">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}

            <li>
              <Menu items={budgetSubmenu} onLinkClick={onClose}>
                <Wallet className="w-5 h-5 text-foreground/60 shrink-0" />
                Budget
              </Menu>
            </li>
          </ul>

          <div className="pt-2 mt-2 border-t border-foreground/10">
            <ul className="text-sm font-medium">
              {navsFooter.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-x-2 text-foreground/80 min-h-[44px] px-3 py-2 rounded-lg hover:bg-foreground/5 active:bg-foreground/10 duration-150"
                  >
                    <span className="text-foreground/60 shrink-0">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
