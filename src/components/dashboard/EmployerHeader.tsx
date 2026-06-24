"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, User, Menu, X, Briefcase } from "lucide-react";
import { logOut } from "@/actions/auth";

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
}

interface HeaderProps {
  profile: UserProfile | null;
  unreadMessageCount?: number;
}

export function Header({ profile, unreadMessageCount = 0 }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const jobsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (jobsDropdownRef.current && !jobsDropdownRef.current.contains(event.target as Node)) {
        setJobsDropdownOpen(false);
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
        setJobsDropdownOpen(false);
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

  const displayName = profile?.first_name || profile?.company_name || "Employer";
  const initials = profile?.first_name 
    ? profile.first_name[0].toUpperCase() 
    : (profile?.company_name ? profile.company_name[0].toUpperCase() : "E");

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex justify-between items-center px-margin-desktop max-w-container-max mx-auto w-full h-16">
        {/* Brand/Logo */}
        <Link
          className="flex items-center gap-3 transition-transform duration-200 hover:opacity-90 scale-102"
          href="/employer/dashboard"
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/employer/dashboard"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Dashboard
          </Link>
          <div className="relative" ref={jobsDropdownRef}>
            <button
              onClick={() => setJobsDropdownOpen(!jobsDropdownOpen)}
              type="button"
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200 focus:outline-none cursor-pointer"
              aria-expanded={jobsDropdownOpen}
              aria-haspopup="true"
            >
              Jobs
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  jobsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {jobsDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 animate-fadeIn z-50 animate-duration-200"
                role="menu"
                aria-label="Jobs actions dropdown"
              >
                <Link
                  href="/employer/jobs"
                  onClick={() => setJobsDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left"
                  role="menuitem"
                >
                  All Job Posts
                </Link>
                <Link
                  href="/employer/jobs/create"
                  onClick={() => setJobsDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left font-medium text-[#006e2f]"
                  role="menuitem"
                >
                  Create a Job Post
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/employer/messages"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200 flex items-center gap-1.5 relative"
          >
            Messages
            {unreadMessageCount > 0 && (
              <span className="px-1.5 py-0.5 bg-[#006e2f] text-white text-[9px] font-bold rounded-full min-w-[14px] text-center leading-none">
                {unreadMessageCount}
              </span>
            )}
          </Link>
          <Link
            href="/employer/pinned"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Pinned
          </Link>
          <Link
            href="/employer/hired"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Hired
          </Link>
          <Link
            href="/employer/pricing"
            className="text-slate-600 hover:text-[#006e2f] font-semibold text-sm transition-colors duration-200"
          >
            Pricing
          </Link>
        </nav>

        {/* Right Section: Utilities & User Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2.5 text-slate-500 hover:text-[#006e2f] hover:bg-slate-50 rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#006e2f] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="View notifications"
          >
            <Bell size={22} />
            {/* Unread Indicator Badge */}
            {unreadMessageCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {unreadMessageCount}
              </span>
            ) : (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </button>

          {/* User Profile Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              type="button"
              className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-slate-50 rounded-2xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#006e2f] cursor-pointer"
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
                  <div className="w-full h-full flex items-center justify-center bg-[#ebfdf2] text-[#006e2f] font-semibold text-sm rounded-full">
                    {initials}
                  </div>
                )}
              </div>

              {/* User / Company Details */}
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
                  href="/employer/settings/account"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left font-semibold"
                  role="menuitem"
                >
                  <User size={16} className="text-slate-400" />
                  Account Settings
                </Link>

                <Link
                  href="/employer/settings/company"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full text-left font-semibold"
                  role="menuitem"
                >
                  <Settings size={16} className="text-slate-400" />
                  Company Settings
                </Link>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors w-full text-left font-bold disabled:opacity-50 cursor-pointer"
                  role="menuitem"
                >
                  <LogOut size={16} className="text-red-500" />
                  {isPending ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="md:hidden flex items-center justify-center p-2 text-slate-500 hover:text-[#006e2f] focus:outline-none rounded-xl hover:bg-slate-50 min-h-[44px] min-w-[44px] cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-margin-desktop py-4 flex flex-col gap-3 shadow-inner animate-fadeIn">
          <Link
            href="/employer/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f] transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/employer/messages"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f] transition-colors flex items-center gap-2"
          >
            Messages
            {unreadMessageCount > 0 && (
              <span className="px-1.5 py-0.5 bg-[#006e2f] text-white text-[9px] font-bold rounded-full min-w-[14px] text-center leading-none">
                {unreadMessageCount}
              </span>
            )}
          </Link>
          <Link
            href="/employer/pinned"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f] transition-colors"
          >
            Pinned
          </Link>
          <Link
            href="/employer/hired"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f] transition-colors"
          >
            Hired
          </Link>
          <Link
            href="/employer/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f] transition-colors"
          >
            Pricing
          </Link>
          <div className="h-px bg-slate-100 my-1" />
          <div className="flex items-center gap-2 text-slate-400 py-1">
            <Briefcase size={16} />
            <p className="text-xs font-bold uppercase tracking-wider">Jobs</p>
          </div>
          <Link
            href="/employer/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="font-medium py-1.5 pl-6 text-slate-600 hover:text-[#006e2f] transition-colors border-l-2 border-transparent hover:border-[#006e2f]"
          >
            All Job Posts
          </Link>
          <Link
            href="/employer/jobs/create"
            onClick={() => setMobileMenuOpen(false)}
            className="font-medium py-1.5 pl-6 text-[#006e2f] hover:text-[#005321] transition-colors border-l-2 border-[#006e2f]"
          >
            Create a Job Post
          </Link>
        </div>
      )}
    </header>
  );
}
