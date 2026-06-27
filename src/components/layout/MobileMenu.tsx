"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { WORKER_NAV_ITEMS } from "@/config/workerNav";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  unreadMessageCount?: number;
}

export function MobileMenu({
  isOpen,
  onClose,
  unreadMessageCount = 0,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="relative flex flex-col w-4/5 max-w-sm bg-white h-full p-6 shadow-2xl transition-transform duration-300 ease-out z-10 animate-slideRight"
      >
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

        <nav className="flex flex-col gap-2 py-6">
          {WORKER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  isActive
                    ? "text-[#006e2f] bg-[#ebfdf2]/70"
                    : "text-slate-700 hover:text-[#006e2f] hover:bg-[#ebfdf2]/50"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={
                  item.href === "/worker/messages" && unreadMessageCount > 0
                    ? `Messages, ${unreadMessageCount} unread`
                    : item.label
                }
              >
                <Icon
                  size={18}
                  className={isActive ? "text-[#006e2f]" : "text-slate-400"}
                />
                {item.label}
                {item.href === "/worker/messages" && unreadMessageCount > 0 ? (
                  <span className="ml-auto px-1.5 py-0.5 bg-[#006e2f] text-white text-[9px] font-bold rounded-full min-w-[14px] text-center leading-none">
                    {unreadMessageCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
