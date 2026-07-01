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
  FileText,
  Bell,
  ClipboardList,
  MessageSquare,
  Flag,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  { href: "/admin/jobs", label: "Job Posts", icon: Briefcase },
  { href: "/admin/identity", label: "Identity", icon: Fingerprint },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/moderation", label: "Moderation", icon: MessageSquare },
  { href: "/admin/billing", label: "Billing", icon: DollarSign },
  { href: "/admin/disputes", label: "Disputes", icon: Scale },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  {
    href: "/admin/settings/team",
    label: "Admin Team",
    icon: UserCog,
    superAdminOnly: true,
  },
  { href: "/admin/settings/pages", label: "Public Pages", icon: FileText },
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
        "/admin/reports",
      ].includes(item.href)
    ),
  },
  {
    label: "Trust & Safety",
    items: ADMIN_NAV_ITEMS.filter((item) =>
      [
        "/admin/identity",
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
        "/admin/settings/pages",
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
