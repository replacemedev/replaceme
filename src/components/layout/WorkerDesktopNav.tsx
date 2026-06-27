"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NavUnderlineLink } from "@/components/shared/nav/NavUnderlineLink";

const PRIMARY = [
  { href: "/worker/dashboard", label: "Dashboard" },
  { href: "/worker/jobs", label: "Jobs" },
  { href: "/worker/saved-jobs", label: "Saved" },
  { href: "/worker/applications", label: "Applications" },
  { href: "/worker/messages", label: "Messages" },
  { href: "/worker/contracts", label: "Offers" },
];

const MORE = [
  { href: "/worker/interviews", label: "Interviews" },
  { href: "/worker/earnings", label: "Earnings" },
  { href: "/worker/job-alerts", label: "Job Alerts" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface WorkerDesktopNavProps {
  unreadMessageCount?: number;
}

export function WorkerDesktopNav({
  unreadMessageCount = 0,
}: WorkerDesktopNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreActive = MORE.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
      {PRIMARY.map((item) => (
        <NavUnderlineLink
          key={item.href}
          href={item.href}
          label={item.label}
          isActive={isActive(pathname, item.href)}
          ariaLabel={
            item.href === "/worker/messages" && unreadMessageCount > 0
              ? `Messages, ${unreadMessageCount} unread`
              : undefined
          }
        >
          {item.href === "/worker/messages" && unreadMessageCount > 0 ? (
            <span className="px-1.5 py-0.5 bg-[#006e2f] text-white text-[9px] font-bold rounded-full min-w-[14px] text-center leading-none">
              {unreadMessageCount}
            </span>
          ) : null}
        </NavUnderlineLink>
      ))}
      <div className="relative" ref={moreRef}>
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          className={`relative py-1 font-semibold text-sm transition-colors duration-200 flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2 rounded-sm ${
            moreActive || moreOpen ? "text-[#006e2f]" : "text-slate-600 hover:text-[#006e2f]"
          }`}
          aria-expanded={moreOpen}
          aria-haspopup="true"
          aria-label="More menu"
        >
          More
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
          />
          <span
            className={`absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#006e2f] transition-transform duration-300 origin-left ${
              moreActive || moreOpen ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>
        {moreOpen ? (
          <div
            className="absolute left-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50"
            role="menu"
          >
            {MORE.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`block px-4 py-2 text-sm hover:bg-slate-50 ${
                  isActive(pathname, item.href)
                    ? "text-[#006e2f] font-semibold"
                    : "text-slate-600"
                }`}
                role="menuitem"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
