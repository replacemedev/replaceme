import { interviewCountsByWeekday } from "@/lib/employer/interviews";
import type { EmployerInterviewRow } from "@/actions/employer/hiring";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface InterviewsCalendarHeaderProps {
  interviews: EmployerInterviewRow[];
}

export function InterviewsCalendarHeader({
  interviews,
}: InterviewsCalendarHeaderProps) {
  const counts = interviewCountsByWeekday(interviews);
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div
      className="grid grid-cols-7 gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
      aria-label="Interviews this week"
    >
      {WEEKDAY_LABELS.map((label, index) => {
        const count = counts[index];
        const isToday = index === todayIndex;

        return (
          <div
            key={label}
            className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 ${
              isToday ? "bg-[#ebfdf2] ring-1 ring-[#006e2f]/20" : ""
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wide ${
                isToday ? "text-[#006e2f]" : "text-slate-400"
              }`}
            >
              {label}
            </span>
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold tabular-nums ${
                count > 0
                  ? "bg-[#006e2f] text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
