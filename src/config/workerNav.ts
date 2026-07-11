import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  MessageSquare,
  Calendar,
  Handshake,
  User,
  Settings,
  DollarSign,
  Bell,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface WorkerNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Primary header + mobile nav (daily workflow). */
export const WORKER_NAV_ITEMS: WorkerNavItem[] = [
  { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/worker/jobs", label: "Jobs", icon: Briefcase },
  { href: "/worker/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { href: "/worker/applications", label: "Applications", icon: FileText },
  { href: "/worker/interviews", label: "Interviews", icon: Calendar },
  { href: "/worker/messages", label: "Messages", icon: MessageSquare },
];

/** Account menu items (avatar dropdown). */
export const WORKER_ACCOUNT_NAV_ITEMS: WorkerNavItem[] = [
  { href: "/worker/profile", label: "Profile", icon: User },
  { href: "/worker/settings", label: "Account Settings", icon: Settings },
  { href: "/worker/earnings", label: "Earnings", icon: DollarSign },
  { href: "/worker/notifications", label: "Notifications", icon: Bell },
  { href: "/worker/verification", label: "Verification", icon: ShieldCheck },
];

export const WORKER_NOTIFICATIONS_HREF = "/worker/notifications";

/** Mobile bottom tab bar (primary daily workflow). */
export const WORKER_TAB_ITEMS: WorkerNavItem[] = [
  { href: "/worker/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/worker/jobs", label: "Jobs", icon: Briefcase },
  { href: "/worker/applications", label: "Apply", icon: FileText },
  { href: "/worker/messages", label: "Chat", icon: MessageSquare },
];

export function isWorkerNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
