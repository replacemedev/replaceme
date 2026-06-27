import type { WorkerInterviewRow } from "@/lib/validations/worker/phase2";

export type WorkerInterviewGroup = {
  key: string;
  label: string;
  items: WorkerInterviewRow[];
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function groupWorkerInterviewsByWeek(
  interviews: WorkerInterviewRow[]
): WorkerInterviewGroup[] {
  if (interviews.length === 0) return [];

  const now = new Date();
  const weekStart = startOfWeek(now).getTime();
  const nextWeekStart = weekStart + 7 * 24 * 60 * 60 * 1000;

  const thisWeek: WorkerInterviewRow[] = [];
  const upcoming: WorkerInterviewRow[] = [];
  const past: WorkerInterviewRow[] = [];

  for (const interview of interviews) {
    const at = new Date(interview.scheduledAt).getTime();
    if (at >= weekStart && at < nextWeekStart) {
      thisWeek.push(interview);
    } else if (at >= nextWeekStart) {
      upcoming.push(interview);
    } else {
      past.push(interview);
    }
  }

  const groups: WorkerInterviewGroup[] = [];
  if (thisWeek.length > 0) {
    groups.push({ key: "this-week", label: "This week", items: thisWeek });
  }
  if (upcoming.length > 0) {
    groups.push({ key: "upcoming", label: "Upcoming", items: upcoming });
  }
  if (past.length > 0) {
    groups.push({ key: "past", label: "Past", items: past });
  }

  return groups;
}
