"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import {
  dismissAnnouncement,
  type EmployerAnnouncementView,
} from "@/actions/admin/announcements";

export function EmployerAnnouncementBanner({
  announcement,
}: {
  announcement: EmployerAnnouncementView;
}) {
  const [hidden, setHidden] = useState(false);
  const [pending, startTransition] = useTransition();

  if (hidden) return null;

  const isTeaser = announcement.variant === "teaser";
  const isPaused = announcement.variant === "paused";

  const onDismiss = () => {
    startTransition(async () => {
      const result = await dismissAnnouncement(announcement.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setHidden(true);
    });
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
        isPaused
          ? "border-amber-200/80 bg-amber-50/70"
          : isTeaser
            ? "border-slate-200/80 bg-white/80"
            : "border-emerald-200/80 bg-[#ebfdf2]/70"
      }`}
      role="status"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isPaused
              ? "bg-amber-100 text-amber-800"
              : "bg-[#ebfdf2] text-[#006e2f]"
          }`}
        >
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">
            {announcement.title}
          </p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
            {announcement.summary}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        {announcement.ctaHref && announcement.ctaLabel ? (
          <Link
            href={announcement.ctaHref}
            className="inline-flex items-center justify-center rounded-xl bg-[#006e2f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0a4a29]"
          >
            {announcement.ctaLabel}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          disabled={pending}
          className="rounded-xl p-2 text-slate-400 hover:bg-white/80 hover:text-slate-600 disabled:opacity-50"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
