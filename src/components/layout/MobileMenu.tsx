"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Briefcase, MessageSquare, LayoutDashboard } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close drawer on click outside the panel content
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        ref={panelRef}
        className="relative flex flex-col w-4/5 max-w-sm bg-white h-full p-6 shadow-2xl transition-transform duration-300 ease-out z-10 animate-slideRight"
      >
        {/* Header / Logo in Drawer */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <Link
            className="flex items-center gap-2.5"
            href="/worker/dashboard"
            onClick={onClose}
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
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links inside drawer */}
        <nav className="flex flex-col gap-4 py-6">
          <Link
            href="/worker/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-[#006e2f] hover:bg-[#ebfdf2]/50 rounded-xl transition-all"
          >
            <LayoutDashboard size={18} className="text-slate-400" />
            Dashboard
          </Link>
          <Link
            href="/worker/jobs"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-[#006e2f] hover:bg-[#ebfdf2]/50 rounded-xl transition-all"
          >
            <Briefcase size={18} className="text-slate-400" />
            Jobs
          </Link>
          <Link
            href="/worker/messages"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-[#006e2f] hover:bg-[#ebfdf2]/50 rounded-xl transition-all"
          >
            <MessageSquare size={18} className="text-slate-400" />
            Messages
          </Link>
        </nav>
      </div>
    </div>
  );
}
