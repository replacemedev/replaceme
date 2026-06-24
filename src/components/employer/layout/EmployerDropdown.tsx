"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { logOut } from "@/actions/auth";
import type { NavProfile } from "@/types/nav";

interface EmployerDropdownProps {
  profile: NavProfile;
  displayName: string;
  initials: string;
}

export function EmployerDropdown({
  profile,
  displayName,
  initials,
}: EmployerDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
        <div className="relative w-8 h-8 rounded-full shrink-0 border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={`${displayName}'s Avatar`}
              fill
              className="rounded-full object-cover"
              sizes="32px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#ebfdf2] text-[#006e2f] font-bold text-xs rounded-full">
              {initials}
            </div>
          )}
        </div>

        <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[120px] truncate select-none">
          {displayName}
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
          className="absolute right-0 mt-2 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn"
          role="menu"
          aria-label="User actions dropdown"
        >
          <div className="px-4 py-2 sm:hidden border-b border-slate-50 mb-1">
            <p className="text-[10px] text-slate-400 font-medium">Logged in as</p>
            <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
          </div>

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
    </div>
  );
}
