import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Calendar,
  Users,
  Pin,
  Settings,
  Bell,
  Star,
  CreditCard,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export const EMPLOYER_NOTIFICATIONS_HREF = "/employer/notifications";

export interface EmployerNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Bottom tab bar (mobile primary). */
export const EMPLOYER_TAB_ITEMS: EmployerNavItem[] = [
  { href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employer/jobs", label: "Jobs", icon: Briefcase },
  { href: "/employer/messages", label: "Messages", icon: MessageSquare },
];

export const EMPLOYER_MORE_TAB = {
  label: "More",
  icon: MoreHorizontal,
} as const;

/** Drawer / More sheet secondary destinations. */
export const EMPLOYER_MORE_NAV_ITEMS: EmployerNavItem[] = [
  { href: "/employer/interviews", label: "Interviews", icon: Calendar },
  { href: "/employer/hired", label: "Hired", icon: Users },
  { href: "/employer/pinned", label: "Pinned", icon: Pin },
  { href: "/employer/settings/account", label: "Account & Billing", icon: Settings },
  { href: EMPLOYER_NOTIFICATIONS_HREF, label: "Notifications", icon: Bell },
  { href: "/employer/reviews", label: "Reviews", icon: Star },
  { href: "/employer/pricing", label: "Pricing", icon: CreditCard },
];

/** Desktop header "More" dropdown (subset aligned with sheet). */
export const EMPLOYER_HEADER_MORE_LINKS = EMPLOYER_MORE_NAV_ITEMS.filter(
  (item) =>
    item.href.startsWith("/employer/settings") ||
    item.href === EMPLOYER_NOTIFICATIONS_HREF ||
    item.href === "/employer/reviews" ||
    item.href === "/employer/pricing"
);

export function isEmployerNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isEmployerJobsActive(pathname: string) {
  return (
    isEmployerNavActive(pathname, "/employer/jobs") ||
    isEmployerNavActive(pathname, "/employer/jobs/create")
  );
}

export function isEmployerMoreActive(pathname: string) {
  return EMPLOYER_MORE_NAV_ITEMS.some((item) => isEmployerNavActive(pathname, item.href));
}
