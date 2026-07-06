"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { WORKER_NAV_ITEMS } from "@/config/workerNav";

import { RoleNavDropdown } from "@/components/shared/nav/RoleNavDropdown";
import type { NavSession } from "@/types/nav";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  unreadMessageCount?: number;
  session?: NavSession;
}

export function MobileMenu({
  isOpen,
  onClose,
  unreadMessageCount = 0,
  session,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      role="dialog"
      aria-modal={isOpen}
      aria-hidden={!isOpen}
    >
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${isOpen ? "opacity-100" : "opacity-0"
          }`}
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={panelRef}
        className={`relative z-10 flex h-full w-[280px] max-w-[75vw] flex-col bg-white p-5 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Link
            className="flex items-center gap-2 rounded-lg transition-transform duration-200 active:scale-[0.98]"
            href="/worker/dashboard"
            onClick={onClose}
          >
            <div className="relative h-7 w-7">
              <Image
                src="/images/logo.png"
                alt="Replace Me Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-display-md text-sm font-bold text-[#0a4a29]">
              Replace Me
            </span>
          </Link>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95 cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 py-4">
          {WORKER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${isActive
                  ? "bg-[#ebfdf2]/70 text-[#006e2f]"
                  : "text-slate-700 hover:bg-[#ebfdf2]/50 hover:text-[#006e2f] active:bg-slate-50"
                  }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={
                  item.href === "/worker/messages" && unreadMessageCount > 0
                    ? `Messages, ${unreadMessageCount} unread`
                    : item.label
                }
              >
                <Icon
                  size={17}
                  className={isActive ? "text-[#006e2f]" : "text-slate-400"}
                />
                {item.label}
                {item.href === "/worker/messages" && unreadMessageCount > 0 ? (
                  <span className="ml-auto min-w-[14px] rounded-full bg-[#006e2f] px-1.5 py-0.5 text-center text-[9px] font-bold leading-none text-white">
                    {unreadMessageCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {session?.isAuthenticated && (
          <div className="hidden lg:block mt-auto border-t border-slate-100 pt-4">
            <RoleNavDropdown session={session} layout="mobile" />
          </div>
        )}
      </div>
    </div>
  );
}
