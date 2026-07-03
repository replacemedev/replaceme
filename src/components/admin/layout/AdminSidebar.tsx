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
    />
  );
}
