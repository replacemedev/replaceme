import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  MessageSquare,
  Calendar,
  Handshake,
  User,
  Pencil,
  Settings,
  DollarSign,
  Award,
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
  { href: "/worker/contracts", label: "Offers", icon: Handshake },
  { href: "/worker/messages", label: "Messages", icon: MessageSquare },
];

/** Account menu items (avatar dropdown). */
export const WORKER_ACCOUNT_NAV_ITEMS: WorkerNavItem[] = [
  { href: "/worker/profile", label: "Profile", icon: User },
  { href: "/worker/profile/edit", label: "Edit Profile", icon: Pencil },
  { href: "/worker/settings", label: "Account Settings", icon: Settings },
  { href: "/worker/earnings", label: "Earnings", icon: DollarSign },
  { href: "/worker/tests", label: "Skill Tests", icon: Award },
  { href: "/worker/job-alerts", label: "Job Alerts", icon: Bell },
  { href: "/worker/notifications", label: "Notifications", icon: Bell },
  { href: "/worker/verification", label: "Verification", icon: ShieldCheck },
];

export const WORKER_NOTIFICATIONS_HREF = "/worker/notifications";
