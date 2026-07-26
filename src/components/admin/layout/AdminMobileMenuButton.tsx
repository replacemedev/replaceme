"use client";

import { Menu } from "lucide-react";
import { useOptionalAdminNav } from "./AdminLayoutChrome";

export function AdminMobileMenuButton() {
  // MFA enroll/challenge layouts render AdminHeader outside AdminLayoutChrome.
  const nav = useOptionalAdminNav();
  if (!nav) return null;

  return (
    <button
      type="button"
      onClick={nav.openMobileNav}
      className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
      aria-label="Open admin navigation"
    >
      <Menu className="h-5 w-5" aria-hidden />
    </button>
  );
}
