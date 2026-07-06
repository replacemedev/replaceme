"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, ListStart, Video, MessageSquare } from "lucide-react";
import type { EmployerInterviewRow } from "@/actions/employer/hiring";
import { InterviewsCalendarHeader } from "./InterviewsCalendarHeader";
import { InterviewCard } from "./InterviewCard";
import { EmployerCalendarView } from "./EmployerCalendarView";
import {
  groupInterviewsByWeek,
  INTERVIEW_BUCKET_LABELS,
  type InterviewWeekBucket,
} from "@/lib/employer/interviews";

interface EmployerInterviewsClientProps {
  interviews: EmployerInterviewRow[];
  planSlug: string;
  messagingEnabled: boolean;
}

const BUCKET_ORDER: InterviewWeekBucket[] = ["this_week", "upcoming", "past"];

export function EmployerInterviewsClient({
  interviews,
  planSlug,
  messagingEnabled,
}: EmployerInterviewsClientProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "agenda">("calendar");

  const grouped = groupInterviewsByWeek(interviews);

  return (
    <div className="space-y-6">
      {/* View Switcher - Only visible on desktop (md and larger) */}
      <div className="hidden md:flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode("calendar")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
            viewMode === "calendar"
              ? "bg-[#006e2f] text-white"
              : "bg-white border border-slate-200 text-slate-650 hover:bg-slate-50"
          }`}
        >
          <CalendarIcon className="h-3.5 w-3.5" aria-hidden />
          Calendar Grid
        </button>
        <button
          type="button"
          onClick={() => setViewMode("agenda")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
            viewMode === "agenda"
              ? "bg-[#006e2f] text-white"
              : "bg-white border border-slate-200 text-slate-650 hover:bg-slate-50"
          }`}
        >
          <ListStart className="h-3.5 w-3.5" aria-hidden />
          Agenda List
        </button>
      </div>

      {/* 1. Desktop Calendar Grid */}
      <div className={viewMode === "calendar" ? "hidden md:block" : "hidden"}>
        <EmployerCalendarView interviews={interviews} />
      </div>

      {/* 2. Mobile View OR Desktop Agenda View */}
      <div className={viewMode === "agenda" ? "block" : "block md:hidden"}>
        <div className="space-y-8">
          <InterviewsCalendarHeader interviews={interviews} />

          {BUCKET_ORDER.map((bucket) => {
            const items = grouped[bucket];
            if (items.length === 0) return null;

            return (
              <section key={bucket} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-450">
                    {INTERVIEW_BUCKET_LABELS[bucket]}
                  </h2>
                  <span className="text-xs font-bold text-slate-400 tabular-nums">
                    {items.length}
                  </span>
                </div>
                <ul className="space-y-4">
                  {items.map((item) => (
                    <InterviewCard
                      key={item.applicationId}
                      interview={item}
                      planSlug={planSlug}
                      messagingEnabled={messagingEnabled}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
