"use client";

import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  EMPLOYER_MORE_NAV_ITEMS,
  isEmployerNavActive,
} from "@/config/employerNav";

import { RoleNavDropdown } from "@/components/shared/nav/RoleNavDropdown";
import type { NavSession } from "@/types/nav";

interface EmployerMoreSheetProps {
  open: boolean;
  onClose: () => void;
  session?: NavSession;
}

/** iOS Safari can cancel Link navigation if the sheet unmounts mid-tap. */
const CLOSE_AFTER_NAV_MS = 50;

export function EmployerMoreSheet({ open, onClose, session }: EmployerMoreSheetProps) {
  const pathname = usePathname();
  const router = useRouter();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onClose();
      closeTimerRef.current = null;
    }, CLOSE_AFTER_NAV_MS);
  }, [onClose]);

  const handleNavClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      // Preserve open-in-new-tab / modified clicks.
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        scheduleClose();
        return;
      }

      event.preventDefault();

      if (href === pathname) {
        onClose();
        return;
      }

      // Push first, then defer unmount so iOS Safari completes the gesture.
      router.push(href);
      scheduleClose();
    },
    [onClose, pathname, router, scheduleClose]
  );

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="More navigation"
        className="relative max-h-[85vh] overflow-y-auto rounded-t-3xl border border-slate-100 bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-slate-900">More</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="space-y-1">
          {EMPLOYER_MORE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isEmployerNavActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 ${
                    active
                      ? "bg-[#ebfdf2] text-[#006e2f]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {session?.isAuthenticated && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <RoleNavDropdown session={session} layout="mobile" />
          </div>
        )}
      </div>
    </div>
  );
}
