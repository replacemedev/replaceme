"use client";

import { useMemo } from "react";
import { AppSidebar } from "@/components/shared/layout/AppSidebar";
import { ADMIN_NAV_ITEMS } from "@/config/adminNav";
import { filterAdminNavItems } from "@/lib/admin/filter-nav";
import type { AppSidebarProfile } from "@/components/shared/layout/AppSidebar";

interface AdminSidebarProps {
  profile: AppSidebarProfile;
  isSuperAdmin?: boolean;
}

export function AdminSidebar({
  profile,
  isSuperAdmin = false,
}: AdminSidebarProps) {
  const items = useMemo(
    () => filterAdminNavItems(ADMIN_NAV_ITEMS, isSuperAdmin),
    [isSuperAdmin]
  );

  return (
    <AppSidebar
      items={items}
      profile={profile}
      showBrand={false}
      footer={
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
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
