import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  ScrollText,
  Settings,
  DollarSign,
  Fingerprint,
  Scale,
  Bell,
  ClipboardList,
  MessageSquare,
  Flag,
  UserCog,
  Mail,
  type LucideIcon,
} from "lucide-react";
import type { AdminCapability } from "@/lib/admin/capabilities";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Legacy flag — always treated as superadmin-only. */
  superAdminOnly?: boolean;
  /** Module capability required for moderators. */
  requiredCapability?: AdminCapability;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    requiredCapability: "dashboard",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    requiredCapability: "users",
  },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: ClipboardList,
    requiredCapability: "applications",
  },
  {
    href: "/admin/jobs",
    label: "Job Posts",
    icon: Briefcase,
    requiredCapability: "jobs",
  },
  {
    href: "/admin/identity",
    label: "Identity",
    icon: Fingerprint,
    requiredCapability: "identity",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: Flag,
    requiredCapability: "reports",
  },
  {
    href: "/admin/reports/email",
    label: "Email",
    icon: Mail,
    superAdminOnly: true,
    requiredCapability: "email",
  },
  {
    href: "/admin/moderation",
    label: "Moderation",
    icon: MessageSquare,
    requiredCapability: "moderation",
  },
  {
    href: "/admin/billing",
    label: "Billing",
    icon: DollarSign,
    requiredCapability: "billing",
  },
  {
    href: "/admin/disputes",
    label: "Disputes",
    icon: Scale,
    requiredCapability: "disputes",
  },
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: Bell,
    requiredCapability: "notifications",
  },
  {
    href: "/admin/audit-log",
    label: "Audit Log",
    icon: ScrollText,
    requiredCapability: "audit_log",
  },
  {
    href: "/admin/security",
    label: "Security",
    icon: ShieldCheck,
    requiredCapability: "security",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    requiredCapability: "settings",
  },
  {
    href: "/admin/settings/team",
    label: "Admin Team",
    icon: UserCog,
    superAdminOnly: true,
    requiredCapability: "team",
  },
];

export const ADMIN_NOTIFICATIONS_HREF = "/admin/notifications";

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Operations",
    items: ADMIN_NAV_ITEMS.filter((item) =>
      [
        "/admin/dashboard",
        "/admin/users",
        "/admin/applications",
        "/admin/jobs",
        "/admin/reports/email",
      ].includes(item.href)
    ),
  },
  {
    label: "Trust & Safety",
    items: ADMIN_NAV_ITEMS.filter((item) =>
      [
        "/admin/identity",
        "/admin/reports",
        "/admin/moderation",
        "/admin/disputes",
        "/admin/notifications",
      ].includes(item.href)
    ),
  },
  {
    label: "Revenue",
    items: ADMIN_NAV_ITEMS.filter((item) =>
      ["/admin/billing"].includes(item.href)
    ),
  },
  {
    label: "Platform",
    items: ADMIN_NAV_ITEMS.filter((item) =>
      [
        "/admin/audit-log",
        "/admin/security",
        "/admin/settings",
        "/admin/settings/team",
      ].includes(item.href)
    ),
  },
];

/** Longest matching nav href wins so parent routes (e.g. /admin/settings) do not stay active on child pages. */
export function getActiveAdminNavHref(
  pathname: string,
  items: ReadonlyArray<{ href: string }>
): string | null {
  const matches = items.filter(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.href.length - a.href.length)[0].href;
}

export function isAdminNavActive(
  pathname: string,
  href: string,
  items?: ReadonlyArray<{ href: string }>
): boolean {
  if (items && items.length > 0) {
    return getActiveAdminNavHref(pathname, items) === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
