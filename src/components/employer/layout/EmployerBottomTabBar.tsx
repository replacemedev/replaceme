"use client";

import { useEffect, useState } from "react";
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

  // Collapse after navigation completes (covers sheet links and nested dropdown links).
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

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
              <li key={tab.href} className="flex">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={
                    showBadge
                      ? `${tab.label}, ${unreadMessageCount} unread messages`
                      : tab.label
                  }
                  className={`w-full relative flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-1.5 px-0.5 text-center text-[10px] tracking-tight font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#006e2f]/30 ${
                    active ? "text-[#006e2f]" : "text-slate-500"
                  }`}
                >
                  <span className="relative flex items-center justify-center h-5 w-5">
                    <Icon className="h-5 w-5" aria-hidden />
                    {showBadge ? (
                      <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#006e2f] text-white text-[8px] font-bold flex items-center justify-center leading-none">
                        {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                      </span>
                    ) : null}
                  </span>
                  <span className="truncate max-w-full leading-tight px-0.5 text-center">
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="flex">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              className={`w-full relative flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-1.5 px-0.5 text-center text-[10px] tracking-tight font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#006e2f]/30 ${
                moreActive ? "text-[#006e2f]" : "text-slate-500"
              }`}
            >
              <span className="relative flex items-center justify-center h-5 w-5">
                <MoreIcon className="h-5 w-5" aria-hidden />
              </span>
              <span className="truncate max-w-full leading-tight px-0.5 text-center">
                {EMPLOYER_MORE_TAB.label}
              </span>
            </button>
          </li>
        </ul>
      </nav>
      <EmployerMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} session={session} />
    </>
  );
}
