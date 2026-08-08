"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ADMIN_NAV_GROUPS, getActiveAdminNavHref } from "@/config/adminNav";
import type { AdminCapability } from "@/lib/admin/capabilities";
import { filterAdminNavGroups } from "@/lib/admin/filter-nav";
import { AvatarImage } from "@/components/shared/media/AvatarImage";

interface AdminMobileDrawerProps {
  open: boolean;
  onClose: () => void;
  isSuperAdmin?: boolean;
  capabilities?: readonly AdminCapability[];
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
  capabilities = [],
  profile,
}: AdminMobileDrawerProps) {
  const pathname = usePathname();
  const navGroups = useMemo(
    () =>
      filterAdminNavGroups(ADMIN_NAV_GROUPS, {
        isSuperAdmin,
        capabilities,
      }),
    [isSuperAdmin, capabilities]
  );
  const navItems = useMemo(
    () => navGroups.flatMap((group) => group.items),
    [navGroups]
  );
  const activeHref = getActiveAdminNavHref(pathname, navItems);

  return (
    <div
      className={`md:hidden fixed inset-0 z-[60] flex transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close navigation"
        onClick={onClose}
        disabled={!open}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className={`relative flex h-[100dvh] max-h-[100dvh] w-[min(300px,88vw)] flex-col border-r border-slate-100 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-3 pb-3 pt-3 shrink-0">
          <Link
            href="/admin/settings/profile"
            onClick={onClose}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
          >
            <AvatarImage
              src={profile.avatarUrl ?? null}
              alt={profile.displayName}
              initials={profile.initials}
              size="sm"
              containerClassName="border border-slate-200 bg-slate-100"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-900">
                {profile.displayName}
              </span>
              <span className="block truncate text-[11px] font-medium text-slate-500">
                {profile.roleLabel}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-6 [-webkit-overflow-scrolling:touch]">
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
                        className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 ${
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
