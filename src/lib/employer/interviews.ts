import type { EmployerInterviewRow } from "@/actions/employer/hiring";

export type InterviewWeekBucket = "this_week" | "upcoming" | "past";

export const INTERVIEW_BUCKET_LABELS: Record<InterviewWeekBucket, string> = {
  this_week: "This week",
  upcoming: "Upcoming",
  past: "Past",
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function groupInterviewsByWeek(
  interviews: EmployerInterviewRow[]
): Record<InterviewWeekBucket, EmployerInterviewRow[]> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const groups: Record<InterviewWeekBucket, EmployerInterviewRow[]> = {
    this_week: [],
    upcoming: [],
    past: [],
  };

  for (const interview of interviews) {
    const scheduled = new Date(interview.scheduledAt);
    if (scheduled < weekStart) {
      groups.past.push(interview);
    } else if (scheduled > weekEnd) {
      groups.upcoming.push(interview);
    } else {
      groups.this_week.push(interview);
    }
  }

  return groups;
}

export function interviewCountsByWeekday(
  interviews: EmployerInterviewRow[]
): number[] {
  const counts = Array.from({ length: 7 }, () => 0);
  const weekStart = startOfWeek(new Date());

  for (const interview of interviews) {
    const scheduled = new Date(interview.scheduledAt);
    const dayIndex = Math.floor(
      (scheduled.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayIndex >= 0 && dayIndex < 7) {
      counts[dayIndex] += 1;
    }
  }

  return counts;
}
