"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  WORKER_TAB_ITEMS,
  isWorkerNavActive,
} from "@/config/workerNav";

interface WorkerBottomTabBarProps {
  unreadMessageCount?: number;
}

export function WorkerBottomTabBar({
  unreadMessageCount = 0,
}: WorkerBottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-100 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {WORKER_TAB_ITEMS.map((tab) => {
          const Icon = tab.icon;
          const active = isWorkerNavActive(pathname, tab.href);
          const showBadge =
            tab.href === "/worker/messages" && unreadMessageCount > 0;

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
                className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-1.5 px-0.5 text-center text-[10px] tracking-tight font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#006e2f]/30 ${
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
                <span className="truncate max-w-full leading-tight">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
