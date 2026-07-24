"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { ChevronDown, LogOut, Settings, User, Flag } from "lucide-react";
import { logOut } from "@/actions/auth";
import type { NavProfile } from "@/types/nav";
import { ReportIssueSlideover } from "@/components/shared/reporting/ReportIssueSlideover";
import { PlanTierBadge } from "@/components/shared/billing/PlanTierBadge";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { useFixedMenuPosition } from "@/hooks/useFixedMenuPosition";

interface EmployerDropdownProps {
  profile: NavProfile | null;
  displayName: string;
  initials: string;
  planUsage?: EmployerPlanUsage | null;
}

export function EmployerDropdown({
  profile,
  displayName,
  initials,
  planUsage = null,
  layout = "desktop",
}: EmployerDropdownProps & { layout?: "desktop" | "mobile" }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuPos = useFixedMenuPosition(dropdownOpen, triggerRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setDropdownOpen(false);
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

  const imageUrl =
    profile?.avatar_url ?? profile?.company_logo_url ?? null;

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
                src={imageUrl}
                alt={`${displayName}'s Avatar`}
                initials={initials}
                size="xs"
                priority
              />
            </div>
            <span className="text-sm font-bold text-slate-800 select-none truncate">
              {displayName}
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
            {planUsage && (
              <div className="px-3 py-2 border-b border-slate-200/60 mb-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plan</span>
                <PlanTierBadge tier={planUsage.planSlug} />
              </div>
            )}

            <Link
              href="/employer/settings/account"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              role="menuitem"
            >
              <User size={14} className="text-slate-400 shrink-0" />
              Account Settings
            </Link>

            <Link
              href="/employer/settings/company"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              role="menuitem"
            >
              <Settings size={14} className="text-slate-400 shrink-0" />
              Company Settings
            </Link>

            {planUsage && planUsage.planSlug !== "scale" && (
              <Link
                href="/employer/pricing"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-[#006e2f] hover:bg-[#ebfdf2]"
              >
                Upgrade Plan
              </Link>
            )}

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

  const desktopMenu =
    dropdownOpen && menuPos ? (
      <div
        ref={menuRef}
        style={{ top: menuPos.top, right: menuPos.right }}
        className="fixed w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-[100] animate-fadeIn"
        role="menu"
        aria-label="User actions dropdown"
      >
        <div className="px-4 py-2 sm:hidden border-b border-slate-50 mb-1">
          <p className="text-[10px] text-slate-400 font-medium">Logged in as</p>
          <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
        </div>

        {planUsage && (
          <div className="px-4 py-2.5 border-b border-slate-50 mb-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plan</span>
              <PlanTierBadge tier={planUsage.planSlug} />
            </div>
            {planUsage.planSlug !== "scale" && (
              <Link
                href="/employer/pricing"
                onClick={() => setDropdownOpen(false)}
                className="mt-2.5 flex w-full justify-center items-center rounded-xl bg-[#006e2f] px-3 py-2 text-xs font-bold text-white hover:bg-[#005c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        )}

        <Link
          href="/employer/settings/account"
          onClick={() => setDropdownOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left font-semibold"
          role="menuitem"
        >
          <User size={14} className="text-slate-400" />
          Account Settings
        </Link>

        <Link
          href="/employer/settings/company"
          onClick={() => setDropdownOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left font-semibold"
          role="menuitem"
        >
          <Settings size={14} className="text-slate-400" />
          Company Settings
        </Link>

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
          <Flag size={14} className="text-slate-400" />
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
    ) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        type="button"
        className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        aria-label="User menu"
      >
        <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-50">
          <AvatarImage
            src={imageUrl}
            alt={`${displayName}'s Avatar`}
            initials={initials}
            size="xs"
            priority
          />
        </div>

        <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[120px] truncate select-none">
          {displayName}
        </span>

        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {mounted && desktopMenu ? createPortal(desktopMenu, document.body) : null}

      <ReportIssueSlideover open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
