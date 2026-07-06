"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video } from "lucide-react";
import type { EmployerInterviewRow } from "@/actions/employer/hiring";
import { InterviewDetailModal } from "./InterviewDetailModal";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface EmployerCalendarViewProps {
  interviews: EmployerInterviewRow[];
}

export function EmployerCalendarView({ interviews }: EmployerCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedInterview, setSelectedInterview] = useState<EmployerInterviewRow | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Build grid (42 days)
  const gridDays: { date: Date; isCurrentMonth: boolean }[] = [];

  // Trailing days of previous month
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    gridDays.push({
      date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    gridDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Leading days of next month
  const remaining = 42 - gridDays.length;
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  for (let i = 1; i <= remaining; i++) {
    gridDays.push({
      date: new Date(nextYear, nextMonth, i),
      isCurrentMonth: false,
    });
  }

  // Get interviews for a date
  const getInterviewsForDate = (date: Date) => {
    return interviews.filter((int) => {
      const d = new Date(int.scheduledAt);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#006e2f]">
            <CalendarIcon size={14} />
          </span>
          <span>{monthLabel}</span>
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div>
        {/* Weekdays */}
        <div className="grid grid-cols-7 text-center mb-1">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="text-[10px] font-black uppercase tracking-wider text-slate-400 py-2"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 border-t border-l border-slate-100/50 rounded-2xl overflow-hidden bg-slate-50/20">
          {gridDays.map(({ date, isCurrentMonth }, index) => {
            const dateInterviews = getInterviewsForDate(date);
            const activeToday = isToday(date);

            return (
              <div
                key={index}
                className={`min-h-[90px] border-r border-b border-slate-100 p-2 flex flex-col justify-between transition-colors bg-white ${
                  isCurrentMonth ? "" : "bg-slate-50/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center text-xs font-bold rounded-full ${
                      activeToday
                        ? "bg-[#006e2f] text-white"
                        : isCurrentMonth
                        ? "text-slate-800"
                        : "text-slate-300"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dateInterviews.length > 0 && (
                    <span className="text-[9px] font-black bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-100">
                      {dateInterviews.length}
                    </span>
                  )}
                </div>

                <div className="mt-1 space-y-1.5 flex-1 flex flex-col justify-end">
                  {dateInterviews.slice(0, 2).map((int) => (
                    <button
                      key={int.applicationId}
                      type="button"
                      onClick={() => setSelectedInterview(int)}
                      className="w-full text-left truncate text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100/80 hover:text-slate-900 border border-slate-100 rounded-lg p-1 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {int.meetingUrl && <Video size={10} className="text-blue-500 shrink-0" />}
                      <span className="truncate">{int.candidateName}</span>
                    </button>
                  ))}
                  {dateInterviews.length > 2 && (
                    <p className="text-[8px] font-bold text-slate-400 text-center">
                      + {dateInterviews.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInterview && (
        <InterviewDetailModal
          open={!!selectedInterview}
          onClose={() => setSelectedInterview(null)}
          interview={selectedInterview}
        />
      )}
    </div>
  );
}
