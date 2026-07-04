"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Flag } from "lucide-react";
import { logOut } from "@/actions/auth";
import { WORKER_ACCOUNT_NAV_ITEMS } from "@/config/workerNav";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { ReportIssueSlideover } from "@/components/shared/reporting/ReportIssueSlideover";

interface WorkerProfile {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface WorkerDropdownProps {
  profile: WorkerProfile | null;
  displayName: string;
  initials: string;
  isVerified?: boolean;
}

export function WorkerDropdown({
  profile,
  displayName,
  initials,
  isVerified = false,
  layout = "desktop",
}: WorkerDropdownProps & { layout?: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logOut();
      } catch (err) {
        console.error("Sign out failed", err);
      }
    });
  };

  if (layout === "mobile") {
    return (
      <div className="w-full" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          type="button"
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer bg-slate-50 border border-slate-100 hover:bg-slate-100/50 focus:outline-none"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="User menu"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
              <AvatarImage
                src={profile?.avatar_url}
                alt={`${displayName}'s Avatar`}
                initials={initials}
                size="xs"
              />
            </div>
            <span className="flex items-center gap-1 text-sm font-bold text-slate-800 select-none truncate">
              <span className="truncate">{displayName}</span>
              <VerifiedBadge show={isVerified} size="sm" />
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div
            className="mt-2 w-full bg-slate-50/50 border border-slate-100 rounded-xl py-1 px-1 flex flex-col gap-0.5 animate-fadeIn"
            role="menu"
            aria-label="User actions"
          >
            {WORKER_ACCOUNT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? "text-[#006e2f] bg-[#ebfdf2]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  role="menuitem"
                >
                  <Icon size={14} className="text-slate-400 shrink-0" />
                  {item.label}
                </Link>
              );
            })}

            <div className="h-px bg-slate-200/60 my-1 mx-2" />

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                setReportOpen(true);
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold cursor-pointer w-full text-left"
              role="menuitem"
            >
              <Flag size={14} className="text-slate-400 shrink-0" />
              Report an issue
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50/50 transition-colors w-full text-left font-bold disabled:opacity-50 cursor-pointer"
              role="menuitem"
            >
              <LogOut size={14} className="text-red-500 shrink-0" />
              {isPending ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        )}

        <ReportIssueSlideover open={reportOpen} onClose={() => setReportOpen(false)} />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        type="button"
        className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        aria-label="User menu"
      >
        <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-50">
          <AvatarImage
            src={profile?.avatar_url}
            alt={`${displayName}'s Avatar`}
            initials={initials}
            size="xs"
          />
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-700 select-none">
          <span className="max-w-[100px] truncate">{displayName}</span>
          <VerifiedBadge show={isVerified} size="sm" />
        </span>

        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {dropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-56 max-h-[min(70vh,480px)] overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn"
          role="menu"
          aria-label="User actions dropdown"
        >
          <div className="px-4 py-2 sm:hidden border-b border-slate-50 mb-1">
            <p className="text-[10px] text-slate-400 font-medium">Logged in as</p>
            <p className="text-xs font-bold text-slate-800 truncate inline-flex items-center gap-1">
              {displayName}
              <VerifiedBadge show={isVerified} size="sm" />
            </p>
          </div>

          {WORKER_ACCOUNT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDropdownOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-xs transition-colors w-full text-left font-semibold ${
                  isActive
                    ? "text-[#006e2f] bg-[#ebfdf2]/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                role="menuitem"
              >
                <Icon size={14} className="text-slate-400 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <div className="h-px bg-slate-100 my-1" />

          <button
            type="button"
            onClick={() => {
              setDropdownOpen(false);
              setReportOpen(true);
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left font-semibold cursor-pointer"
            role="menuitem"
          >
            <Flag size={14} className="text-slate-400 shrink-0" />
            Report an issue
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50/50 transition-colors w-full text-left font-bold disabled:opacity-50 cursor-pointer"
            role="menuitem"
          >
            <LogOut size={14} className="text-red-500" />
            {isPending ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      )}

      <ReportIssueSlideover open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
