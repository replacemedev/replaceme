import { AvatarImage } from "@/components/shared/media/AvatarImage";
import type { StaffDirectoryMember } from "@/actions/admin/profile";
import { formatTimeZoneLabel } from "@/lib/admin/timezones";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function StaffDirectoryGrid({
  members,
  emptyMessage,
}: {
  members: StaffDirectoryMember[];
  emptyMessage: string;
}) {
  if (members.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <li
          key={member.userId}
          className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-start gap-3">
            <AvatarImage
              src={member.avatarUrl}
              alt={member.displayName}
              initials={initials(member.displayName)}
              size="sm"
              containerClassName="h-14 w-14 min-h-14 min-w-14 border border-slate-200 bg-slate-100"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-900">
                {member.displayName}
              </p>
              <p className="text-xs font-semibold text-[#006e2f]">
                {member.roleLabel}
              </p>
              {member.department ? (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {member.department}
                </p>
              ) : null}
            </div>
          </div>
          {member.bio ? (
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-slate-600">
              {member.bio}
            </p>
          ) : null}
          {member.timezone ? (
            <p className="mt-auto pt-4 text-[11px] font-medium text-slate-400">
              {formatTimeZoneLabel(member.timezone)}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
