"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { AdminDropdown } from "./AdminDropdown";
import { ADMIN_NAV_GROUPS, getActiveAdminNavHref } from "@/config/adminNav";
import { filterAdminNavGroups } from "@/lib/admin/filter-nav";

interface AdminMobileDrawerProps {
  open: boolean;
  onClose: () => void;
  isSuperAdmin?: boolean;
  profile: {
    displayName: string;
    roleLabel: string;
    initials: string;
    avatarUrl?: string | null;
  };
}

export function AdminMobileDrawer({
  open,
  onClose,
  isSuperAdmin = false,
  profile,
}: AdminMobileDrawerProps) {
  const pathname = usePathname();
  const navGroups = useMemo(
    () => filterAdminNavGroups(ADMIN_NAV_GROUPS, isSuperAdmin),
    [isSuperAdmin]
  );
  const navItems = useMemo(
    () => navGroups.flatMap((group) => group.items),
    [navGroups]
  );
  const activeHref = getActiveAdminNavHref(pathname, navItems);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[60] flex">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className="relative flex h-full w-[min(300px,88vw)] flex-col border-r border-slate-100 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <p className="text-sm font-bold text-slate-900 hidden sm:block">Admin menu</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 ml-auto"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-4 py-4">
          <AdminDropdown
            profile={{
              avatar_url: profile.avatarUrl || null,
              first_name: null,
              last_name: null,
              username: null,
            }}
            displayName={profile.displayName}
            initials={profile.initials}
            layout="mobile"
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === activeHref;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 ${
                          active
                            ? "bg-[#ebfdf2] text-[#006e2f]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>


      </aside>
    </div>
  );
}
