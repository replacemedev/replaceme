"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { ApplicantStatus } from "@/types/employer/applicants";

interface StatusDropdownProps {
  status: ApplicantStatus;
  onStatusChange: (status: ApplicantStatus) => Promise<void>;
  disabled?: boolean;
}

export function StatusDropdown({
  status,
  onStatusChange,
  disabled = false,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statuses: ApplicantStatus[] = ["Applied", "Interviewing", "Shortlisted", "Rejected", "Hired"];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newStatus: ApplicantStatus) => {
    if (newStatus === status) {
      setOpen(false);
      return;
    }
    setOpen(false);
    startTransition(async () => {
      await onStatusChange(newStatus);
    });
  };

  // Set colors based on active status
  const getColorStyles = (s: ApplicantStatus) => {
    switch (s) {
      case "Interviewing":
        return "bg-amber-50 text-amber-800 border-amber-200/50 hover:bg-amber-100/50";
      case "Shortlisted":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/50 hover:bg-emerald-100/50";
      case "Rejected":
        return "bg-red-50 text-red-800 border-red-200/50 hover:bg-red-100/50";
      case "Hired":
        return "bg-blue-50 text-blue-800 border-blue-200/50 hover:bg-blue-100/50";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/50 hover:bg-slate-100/50";
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => !disabled && !isPending && setOpen(!open)}
        disabled={disabled || isPending}
        type="button"
        className={`h-8 px-3 border rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${getColorStyles(
          status
        )} ${disabled || isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <span>{status}</span>
        )}
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 animate-fadeIn z-50 origin-top-right"
          role="menu"
          aria-label="Status selection dropdown"
        >
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSelect(s)}
              className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-colors ${
                s === status
                  ? "bg-slate-50 text-[#006e2f]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              role="menuitem"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
