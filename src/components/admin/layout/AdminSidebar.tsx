"use client";

import { useState, useTransition } from "react";
import { AppSidebar } from "@/components/shared/layout/AppSidebar";
import { ADMIN_NAV_ITEMS } from "@/config/adminNav";
import type { AppSidebarProfile } from "@/components/shared/layout/AppSidebar";
import { saveUxPreferences } from "@/actions/ux-preferences";

interface AdminSidebarProps {
  profile: AppSidebarProfile;
  initialCollapsed?: boolean;
}

export function AdminSidebar({
  profile,
  initialCollapsed = false,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [, startTransition] = useTransition();

  const handleCollapsedChange = (next: boolean) => {
    setCollapsed(next);
    startTransition(async () => {
      await saveUxPreferences({ sidebarCollapsed: next });
    });
  };

  return (
    <AppSidebar
      items={ADMIN_NAV_ITEMS}
      profile={profile}
      showBrand={false}
      collapsed={collapsed}
      onCollapsedChange={handleCollapsedChange}
      footer={
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Environment
          </p>
          <p className="text-xs font-bold text-[#006e2f] mt-0.5">
            {process.env.NODE_ENV === "production" ? "Production" : "Development"}
          </p>
        </div>
      }
    />
  );
}
