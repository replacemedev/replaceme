interface ApplicationTimelineEvent {
  label: string;
  at: string;
}

interface ApplicationTimelineProps {
  events: ApplicationTimelineEvent[];
}

export function ApplicationTimeline({ events }: ApplicationTimelineProps) {
  return (
    <ol className="space-y-4">
      {events.map((event, index) => (
        <li key={`${event.label}-${index}`} className="flex gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#006e2f]" />
          <div>
            <p className="text-sm font-semibold text-slate-900">{event.label}</p>
            <p className="text-xs text-slate-400">
              {new Date(event.at).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
