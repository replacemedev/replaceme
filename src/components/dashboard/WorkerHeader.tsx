"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, FileText, User } from "lucide-react";
import { logOut } from "@/actions/auth";

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface WorkerHeaderProps {
  profile: UserProfile | null;
}

export function WorkerHeader({ profile }: WorkerHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
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

  const displayName = profile?.first_name || profile?.username || "Worker";
  const initials = profile?.first_name 
    ? profile.first_name[0].toUpperCase() 
    : (profile?.username ? profile.username[0].toUpperCase() : "W");

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full h-16">
        {/* Brand/Logo */}
        <Link
          className="flex items-center gap-3 transition-transform duration-200 hover:opacity-90 scale-102"
          href="/worker/dashboard"
        >
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src="/images/logo_favicon.png"
              alt="Replace Me Logo"
              fill
              className="object-contain"
              sizes="40px"
              priority
            />
          </div>
          <span className="font-display-md text-xl font-bold text-[#0a4a29] leading-none relative top-[-2px]">
            Replace Me
          </span>
        </Link>

        {/* Right Section: Utilities & User Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2.5 text-slate-500 hover:text-[#22c55e] hover:bg-slate-50 rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#22c55e] min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="View notifications"
          >
            <Bell size={22} />
            {/* Unread Indicator Badge */}
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
          </button>

          {/* User Profile Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              type="button"
              className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-slate-50 rounded-2xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#22c55e] aria-expanded={dropdownOpen}"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-label="User menu"
            >
              {/* User Avatar / Initials */}
              <div className="relative w-9 h-9 rounded-full shrink-0 border border-slate-100 bg-slate-50">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={`${displayName}'s Avatar`}
                    fill
                    className="rounded-full object-cover"
                    sizes="36px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-semibold text-sm rounded-full">
                    {initials}
                  </div>
                )}
              </div>

              {/* User Details */}
              <span className="hidden sm:inline-block text-sm font-semibold text-slate-700 max-w-[150px] truncate">
                {displayName}
              </span>

              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Panel */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 animate-fadeIn z-50"
                role="menu"
                aria-label="User actions dropdown"
              >
                {/* Header Information for Mobile View */}
                <div className="px-4 py-2 sm:hidden border-b border-slate-50 mb-1">
                  <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                </div>

                <Link
                  href="/worker/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left"
                  role="menuitem"
                >
                  <User size={16} className="text-slate-400" />
                  Profile / Resume Settings
                </Link>

                <Link
                  href="/worker/dashboard/applications"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left"
                  role="menuitem"
                >
                  <FileText size={16} className="text-slate-400" />
                  My Applications
                </Link>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors w-full text-left font-medium disabled:opacity-50"
                  role="menuitem"
                >
                  <LogOut size={16} className="text-red-500" />
                  {isPending ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
