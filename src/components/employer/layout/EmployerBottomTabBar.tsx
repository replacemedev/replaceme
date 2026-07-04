"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  EMPLOYER_TAB_ITEMS,
  EMPLOYER_MORE_TAB,
  isEmployerMoreActive,
  isEmployerNavActive,
} from "@/config/employerNav";
import { EmployerMoreSheet } from "./EmployerMoreSheet";

import type { NavSession } from "@/types/nav";

interface EmployerBottomTabBarProps {
  unreadMessageCount?: number;
  session?: NavSession;
}

export function EmployerBottomTabBar({
  unreadMessageCount = 0,
  session,
}: EmployerBottomTabBarProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const MoreIcon = EMPLOYER_MORE_TAB.icon;
  const moreActive = isEmployerMoreActive(pathname);

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-100 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-4">
          {EMPLOYER_TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const active = isEmployerNavActive(pathname, tab.href);
            const showBadge =
              tab.href === "/employer/messages" && unreadMessageCount > 0;

            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={
                    showBadge
                      ? `${tab.label}, ${unreadMessageCount} unread messages`
                      : tab.label
                  }
                  className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-2 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#006e2f]/30 ${
                    active ? "text-[#006e2f]" : "text-slate-500"
                  }`}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" aria-hidden />
                    {showBadge ? (
                      <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#006e2f] text-white text-[8px] font-bold flex items-center justify-center leading-none">
                        {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                      </span>
                    ) : null}
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-2 w-full text-[10px] font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#006e2f]/30 ${
                moreActive ? "text-[#006e2f]" : "text-slate-500"
              }`}
            >
              <MoreIcon className="h-5 w-5" aria-hidden />
              {EMPLOYER_MORE_TAB.label}
            </button>
          </li>
        </ul>
      </nav>
      <EmployerMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} session={session} />
    </>
  );
}
