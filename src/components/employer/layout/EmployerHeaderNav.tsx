"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, Briefcase } from "lucide-react";
import { NavUnderlineLink } from "@/components/shared/nav/NavUnderlineLink";

const MORE_LINKS = [
  { href: "/employer/notifications", label: "Notifications" },
  { href: "/employer/credits", label: "Credits" },
  { href: "/employer/reviews", label: "Reviews" },
  { href: "/employer/pricing", label: "Pricing" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface EmployerHeaderNavProps {
  unreadMessageCount?: number;
}

export function EmployerHeaderNav({
  unreadMessageCount = 0,
}: EmployerHeaderNavProps) {
  const pathname = usePathname();
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const jobsDropdownRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const jobsActive =
    isActive(pathname, "/employer/jobs") ||
    isActive(pathname, "/employer/jobs/create");
  const moreActive = MORE_LINKS.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        jobsDropdownRef.current &&
        !jobsDropdownRef.current.contains(event.target as Node)
      ) {
        setJobsDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setJobsDropdownOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
      <NavUnderlineLink
        href="/employer/dashboard"
        label="Dashboard"
        isActive={isActive(pathname, "/employer/dashboard")}
      />
      <div className="relative" ref={jobsDropdownRef}>
        <button
          type="button"
          onClick={() => setJobsDropdownOpen((open) => !open)}
          className={`relative py-1 font-semibold text-sm transition-colors duration-200 flex items-center gap-1 cursor-pointer ${
            jobsActive || jobsDropdownOpen
              ? "text-[#006e2f]"
              : "text-slate-600 hover:text-[#006e2f]"
          }`}
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
          <span
            className={`absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#006e2f] transition-transform duration-300 origin-left ${
              jobsActive || jobsDropdownOpen ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>
        {jobsDropdownOpen ? (
          <div
            className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50"
            role="menu"
            aria-label="Jobs actions dropdown"
          >
            <Link
              href="/employer/jobs"
              onClick={() => setJobsDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 w-full text-left"
              role="menuitem"
            >
              All Job Posts
            </Link>
            <Link
              href="/employer/jobs/create"
              onClick={() => setJobsDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#006e2f] hover:bg-slate-50 w-full text-left"
              role="menuitem"
            >
              Create a Job Post
            </Link>
          </div>
        ) : null}
      </div>
      <NavUnderlineLink
        href="/employer/messages"
        label="Messages"
        isActive={isActive(pathname, "/employer/messages")}
      >
        {unreadMessageCount > 0 ? (
          <span className="px-1.5 py-0.5 bg-[#006e2f] text-white text-[9px] font-bold rounded-full min-w-[14px] text-center leading-none">
            {unreadMessageCount}
          </span>
        ) : null}
      </NavUnderlineLink>
      <NavUnderlineLink
        href="/employer/interviews"
        label="Interviews"
        isActive={isActive(pathname, "/employer/interviews")}
      />
      <NavUnderlineLink
        href="/employer/hired"
        label="Hired"
        isActive={isActive(pathname, "/employer/hired")}
      />
      <NavUnderlineLink
        href="/employer/pinned"
        label="Pinned"
        isActive={isActive(pathname, "/employer/pinned")}
      />
      <div className="relative" ref={moreRef}>
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          className={`relative py-1 font-semibold text-sm transition-colors duration-200 flex items-center gap-1 cursor-pointer ${
            moreActive || moreOpen ? "text-[#006e2f]" : "text-slate-600 hover:text-[#006e2f]"
          }`}
          aria-expanded={moreOpen}
          aria-haspopup="true"
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
          <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 max-h-[70vh] overflow-y-auto">
            {MORE_LINKS.map((item) => (
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

interface EmployerMobileMenuProps {
  unreadMessageCount?: number;
}

export function EmployerMobileMenu({
  unreadMessageCount = 0,
}: EmployerMobileMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        type="button"
        className="md:hidden flex items-center justify-center p-2 text-slate-500 hover:text-[#006e2f] rounded-xl hover:bg-slate-50 min-h-[44px] min-w-[44px] cursor-pointer"
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileMenuOpen ? (
        <div className="md:hidden absolute top-full left-0 w-full border-t border-slate-100 bg-white px-margin-desktop py-4 flex flex-col gap-3 shadow-inner z-40">
          <Link
            href="/employer/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f]"
          >
            Dashboard
          </Link>
          <Link
            href="/employer/messages"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f] flex items-center gap-2"
          >
            Messages
            {unreadMessageCount > 0 ? (
              <span className="px-1.5 py-0.5 bg-[#006e2f] text-white text-[9px] font-bold rounded-full min-w-[14px] text-center leading-none">
                {unreadMessageCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/employer/interviews"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f]"
          >
            Interviews
          </Link>
          <Link
            href="/employer/hired"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f]"
          >
            Hired
          </Link>
          <Link
            href="/employer/pinned"
            onClick={() => setMobileMenuOpen(false)}
            className="font-semibold py-2 text-slate-700 hover:text-[#006e2f]"
          >
            Pinned
          </Link>
          {MORE_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-semibold py-2 text-slate-700 hover:text-[#006e2f]"
            >
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-slate-100 my-1" />
          <div className="flex items-center gap-2 text-slate-400 py-1">
            <Briefcase size={16} />
            <p className="text-xs font-bold uppercase tracking-wider">Jobs</p>
          </div>
          <Link
            href="/employer/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="font-medium py-1.5 pl-6 text-slate-600 hover:text-[#006e2f] border-l-2 border-transparent hover:border-[#006e2f]"
          >
            All Job Posts
          </Link>
          <Link
            href="/employer/jobs/create"
            onClick={() => setMobileMenuOpen(false)}
            className="font-medium py-1.5 pl-6 text-[#006e2f] border-l-2 border-[#006e2f]"
          >
            Create a Job Post
          </Link>
        </div>
      ) : null}
    </>
  );
}
