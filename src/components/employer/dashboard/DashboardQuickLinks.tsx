import Link from "next/link";
import {
  Briefcase,
  Bookmark,
  MessageSquare,
  Calendar,
  Users,
  ArrowRight,
} from "lucide-react";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

const QUICK_LINKS = [
  {
    href: "/employer/jobs",
    label: "View pipelines",
    description: "Manage job posts and applicants",
    icon: Briefcase,
  },
  {
    href: "/employer/pinned",
    label: "Pinned talent",
    description: "Bookmarked candidates",
    icon: Bookmark,
  },
  {
    href: "/employer/messages",
    label: "Messages",
    description: "Chat with candidates",
    icon: MessageSquare,
  },
  {
    href: "/employer/interviews",
    label: "Interviews",
    description: "Scheduled conversations",
    icon: Calendar,
  },
  {
    href: "/employer/hired",
    label: "Hired team",
    description: "Active contracts",
    icon: Users,
  },
] as const;

export function DashboardQuickLinks() {
  return (
    <nav aria-label="Quick links" className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {QUICK_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${EMPLOYER_CARD} group flex flex-col gap-2 p-4 transition-colors hover:border-[#006e2f]/20 hover:bg-[#fafdfb]`}
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
