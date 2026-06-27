import Link from "next/link";
import {
  Briefcase,
  FileText,
  MessageSquare,
  Calendar,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

const QUICK_LINKS = [
  {
    href: "/worker/jobs",
    label: "Browse jobs",
    description: "Find roles that match your skills",
    icon: Briefcase,
  },
  {
    href: "/worker/applications",
    label: "Applications",
    description: "Track proposal status",
    icon: FileText,
  },
  {
    href: "/worker/messages",
    label: "Messages",
    description: "Chat with employers",
    icon: MessageSquare,
  },
  {
    href: "/worker/interviews",
    label: "Interviews",
    description: "Upcoming conversations",
    icon: Calendar,
  },
  {
    href: "/worker/saved-jobs",
    label: "Saved jobs",
    description: "Roles you bookmarked",
    icon: Bookmark,
  },
] as const;

export function WorkerDashboardQuickLinks() {
  return (
    <nav aria-label="Quick links" className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {QUICK_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${WORKER_CARD} group flex flex-col gap-2 p-4 transition-colors hover:border-[#006e2f]/20 hover:bg-[#fafdfb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 focus-visible:ring-offset-2`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <ArrowRight
                className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#006e2f]"
                aria-hidden
              />
            </div>
            <span className="text-xs font-bold text-slate-900">{link.label}</span>
            <span className="text-[11px] font-medium text-slate-500 leading-snug">
              {link.description}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
