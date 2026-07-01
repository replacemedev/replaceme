"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { UX_SIDEBAR_COOKIE } from "@/lib/cookies/constants";
import { hasCookieConsent, setUxCookie } from "@/lib/cookies/client";

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
  showBrand?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AppSidebar({
  items,
  profile,
  footer,
  showBrand = true,
  collapsed = false,
  onCollapsedChange,
}: AppSidebarProps) {
  const pathname = usePathname();

  const toggleCollapsed = () => {
    const next = !collapsed;
    if (hasCookieConsent()) {
      setUxCookie(UX_SIDEBAR_COOKIE, next ? "collapsed" : "expanded");
    }
    onCollapsedChange?.(next);
  };

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shrink-0 transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {showBrand ? (
        <div className="px-5 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800">
          {!collapsed ? <NavBrand homeHref={profile.homeHref} compact /> : null}
        </div>
      ) : null}

      <div
        className={`px-4 py-5 border-b border-slate-100 dark:border-slate-800 ${showBrand ? "" : "pt-6"}`}
      >
        <div
          className={`flex items-center rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-xs shrink-0"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ebfdf2] text-sm font-bold text-[#006e2f] border border-emerald-100">
              {profile.initials}
            </span>
          )}
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {profile.displayName}
              </p>
              <p className="truncate text-xs font-semibold text-[#22c55e]">
                {profile.roleLabel}
              </p>
            </div>
          ) : null}
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
              title={collapsed ? label : undefined}
              className={`flex items-center rounded-xl text-sm font-semibold transition-colors ${
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-[#ebfdf2] dark:bg-emerald-950/40 text-[#006e2f] shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-[#22c55e]" : "text-slate-400"}`}
                aria-hidden
              />
              {!collapsed ? <span>{label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {onCollapsedChange ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" aria-hidden />
                <span>Collapse</span>
              </>
            )}
          </button>
        ) : null}
        {footer && !collapsed ? (
          <div className="px-1">{footer}</div>
        ) : null}
      </div>
    </aside>
  );
}
