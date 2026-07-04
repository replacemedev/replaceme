"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import type { NavSession } from "@/types/nav";

interface MobileTriggerAndMenuProps {
  unreadMessageCount?: number;
  session?: NavSession;
}

export function MobileTriggerAndMenu({
  unreadMessageCount = 0,
  session,
}: MobileTriggerAndMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen((open) => !open)}
        type="button"
        className="relative md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-slate-50 hover:text-[#006e2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 cursor-pointer"
        aria-expanded={mobileMenuOpen}
        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        <Menu
          size={20}
          className={`absolute transition-all duration-300 ease-out ${
            mobileMenuOpen
              ? "scale-75 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100"
          }`}
          aria-hidden
        />
        <X
          size={20}
          className={`absolute transition-all duration-300 ease-out ${
            mobileMenuOpen
              ? "scale-100 rotate-0 opacity-100"
              : "scale-75 -rotate-90 opacity-0"
          }`}
          aria-hidden
        />
      </button>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        unreadMessageCount={unreadMessageCount}
        session={session}
      />
    </>
  );
}
