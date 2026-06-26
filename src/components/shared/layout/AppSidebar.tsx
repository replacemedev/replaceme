"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { NavBrand } from "@/components/shared/nav/NavBrand";

export interface AppSidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AppSidebarProfile {
  displayName: string;
  roleLabel: string;
  initials: string;
  avatarUrl?: string | null;
  homeHref: string;
}

interface AppSidebarProps {
  items: AppSidebarNavItem[];
  profile: AppSidebarProfile;
  footer?: React.ReactNode;
}

export function AppSidebar({ items, profile, footer }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col bg-white border-r border-slate-200/80 w-[260px] shrink-0">
      <div className="px-5 pt-6 pb-5 border-b border-slate-100">
        <NavBrand homeHref={profile.homeHref} compact />
      </div>

      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-xs"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebfdf2] text-sm font-bold text-[#006e2f] border border-emerald-100">
              {profile.initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {profile.displayName}
            </p>
            <p className="truncate text-xs font-semibold text-[#22c55e]">
              {profile.roleLabel}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1 px-3 py-4 overflow-y-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#ebfdf2] text-[#006e2f] shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-[#22c55e]" : "text-slate-400"}`}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {footer ? (
        <div className="mt-auto px-4 py-4 border-t border-slate-100">{footer}</div>
      ) : null}
    </aside>
  );
}
