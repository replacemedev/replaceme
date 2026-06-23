"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, FileText, User, Menu, X, Briefcase, MessageSquare } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        // Only close if it's open
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown/menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
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
      <div className="flex justify-between items-center px-4 sm:px-8 max-w-7xl mx-auto w-full h-16">
        
        {/* Left Section: Brand/Logo & Mobile Menu Trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            type="button"
            className="md:hidden p-2 text-slate-500 hover:text-[#006e2f] hover:bg-slate-50 rounded-xl transition-all duration-200"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <Link
            className="flex items-center gap-3 transition-transform duration-200 hover:opacity-90 scale-102"
            href="/worker/dashboard"
          >
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src="/images/logo_favicon.png"
                alt="Replace Me Logo"
                fill
                className="object-contain"
                sizes="36px"
                priority
              />
            </div>
            <span className="font-display-md text-lg font-bold text-[#0a4a29] leading-none relative top-[-1px]">
              Replace Me
            </span>
          </Link>
        </div>

        {/* Middle Section: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/worker/dashboard"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            href="/worker/jobs"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Jobs
          </Link>
          <Link
            href="/worker/messages"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Messages
          </Link>
        </nav>

        {/* Right Section: Utilities & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-[#006e2f] hover:bg-slate-50 rounded-xl transition-all duration-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="View notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full animate-pulse" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              type="button"
              className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-2xl transition-all duration-200"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-label="User menu"
            >
              {/* User Avatar */}
              <div className="relative w-8 h-8 rounded-full shrink-0 border border-slate-100 bg-slate-50">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={`${displayName}'s Avatar`}
                    fill
                    className="rounded-full object-cover"
                    sizes="32px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#ebfdf2] text-[#006e2f] font-semibold text-xs rounded-full">
                    {initials}
                  </div>
                )}
              </div>

              <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                {displayName}
              </span>

              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn"
                role="menu"
                aria-label="User actions dropdown"
              >
                <div className="px-4 py-2 sm:hidden border-b border-slate-50 mb-1">
                  <p className="text-[10px] text-slate-400 font-medium">Logged in as</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                </div>

                <Link
                  href="/worker/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left"
                  role="menuitem"
                >
                  <User size={14} className="text-slate-400" />
                  Profile & Resume
                </Link>

                <Link
                  href="/worker/dashboard/applications"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left"
                  role="menuitem"
                >
                  <FileText size={14} className="text-slate-400" />
                  My Applications
                </Link>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50/50 transition-colors w-full text-left font-semibold disabled:opacity-50"
                  role="menuitem"
                >
                  <LogOut size={14} className="text-red-500" />
                  {isPending ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div 
            ref={mobileMenuRef}
            className="relative flex flex-col w-4/5 max-w-sm bg-white h-full p-6 shadow-2xl transition-transform duration-300 ease-out"
          >
            {/* Header / Logo in Drawer */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <Link
                className="flex items-center gap-2.5"
                href="/worker/dashboard"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="relative w-8 h-8">
                  <Image
                    src="/images/logo_favicon.png"
                    alt="Replace Me Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-display-md text-base font-bold text-[#0a4a29]">
                  Replace Me
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                type="button"
                className="p-2 text-slate-400 hover:text-slate-900 rounded-xl"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation links inside drawer */}
            <nav className="flex flex-col gap-4 py-6">
              <Link
                href="/worker/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-[#006e2f] hover:bg-[#ebfdf2]/50 rounded-xl transition-all"
              >
                <Briefcase size={18} className="text-slate-400" />
                Dashboard
              </Link>
              <Link
                href="/worker/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-[#006e2f] hover:bg-[#ebfdf2]/50 rounded-xl transition-all"
              >
                <Briefcase size={18} className="text-slate-400" />
                Jobs
              </Link>
              <Link
                href="/worker/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-[#006e2f] hover:bg-[#ebfdf2]/50 rounded-xl transition-all"
              >
                <MessageSquare size={18} className="text-slate-400" />
                Messages
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
