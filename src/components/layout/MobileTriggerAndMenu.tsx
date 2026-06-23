"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

export function MobileTriggerAndMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(true)}
        type="button"
        className="md:hidden p-2 text-slate-500 hover:text-[#006e2f] hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer"
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
