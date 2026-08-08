import Link from "next/link";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatFullName } from "@/lib/format/name";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import type { AdminWorkerProfileDeepDive } from "@/actions/admin/deep-dive";

interface WorkerDeepDiveViewProps {
  data: AdminWorkerProfileDeepDive;
}

function formatExperiencePeriod(
  startDate: string,
  endDate: string | null
): string {
  const start = new Date(startDate);
  const startLabel = Number.isNaN(start.getTime())
    ? startDate
    : start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  if (!endDate) return `${startLabel} – Present`;
  const end = new Date(endDate);
  const endLabel = Number.isNaN(end.getTime())
    ? endDate
    : end.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

export function WorkerDeepDiveView({ data }: WorkerDeepDiveViewProps) {
  const name =
    formatFullName(data.firstName, data.middleName, data.lastName, data.suffix).trim() ||
    "Unnamed worker";
  const spokenLanguages = data.spokenLanguages ?? [];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 inline-flex items-center gap-1.5 flex-wrap min-w-0 max-w-full">
            <span className="truncate min-w-0">{name}</span>
            <VerifiedBadge show={data.isVerified} size="md" />
          </h2>
          <p className="mt-1 text-sm text-slate-500">{data.email}</p>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {data.professionalTitle ?? "—"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={data.accountStatus} />
            {data.verificationStatus ? (
              <StatusBadge status={data.verificationStatus} />
            ) : null}
          </div>
          {data.bio ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-700">{data.bio}</p>
          ) : null}
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Location</dt>
              <dd className="text-slate-800 font-semibold">{data.location ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Availability</dt>
              <dd className="text-slate-800 font-semibold">{data.availability ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Hourly rate</dt>
              <dd className="text-slate-800 font-mono font-semibold">
                {data.hourlyRate != null
                  ? `${data.hourlyRate} ${data.salaryCurrency}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Gender</dt>
              <dd className="text-slate-800 font-semibold">{data.gender ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-slate-400">
                Spoken Languages
              </dt>
              <dd className="mt-1.5">
                {spokenLanguages.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {spokenLanguages.map((lang) => (
                      <span
                        key={lang}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-800 font-semibold">—</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Birthdate</dt>
              <dd className="text-slate-800 font-semibold">{data.birthDate ?? "—"}</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Statutory Details</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-400">TIN</dt>
                <dd className="text-slate-800 font-semibold">{data.tinNumber ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Identity Document verification</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-400">ID Type</dt>
                <dd className="text-slate-800 font-semibold">{data.idType ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-400">ID Number</dt>
                <dd className="text-slate-800 font-semibold">{data.idNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-400">ID Expiration Date</dt>
                <dd className="text-slate-800 font-semibold">{data.idExpirationDate ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-400">ID Issuing Country</dt>
                <dd className="text-slate-800 font-semibold">{data.idIssuingCountry ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Joined {new Date(data.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <AdminSectionLabel>Top skills</AdminSectionLabel>
          {data.skills.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No skills listed.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.skills.map((skill) => (
                <li
                  key={skill.skillName}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="font-medium text-slate-800">{skill.skillName}</span>
                  <span className="text-xs text-slate-500">
                    {skill.proficiencyLabel ?? skill.proficiency}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {data.jobExperiences.length > 0 ? (
        <section className="space-y-4">
          <AdminSectionLabel>Job Experience</AdminSectionLabel>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.jobExperiences.map((exp) => (
              <li
                key={exp.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              >
                <p className="font-semibold text-slate-900">{exp.roleTitle}</p>
                <p className="text-xs text-slate-500">
                  {exp.companyName} · {formatExperiencePeriod(exp.startDate, exp.endDate)}
                </p>
                <p className="mt-2 text-sm text-slate-700 line-clamp-3">{exp.description}</p>
                {exp.skillsUsed.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exp.skillsUsed.map((skill) => (
                      <span
                        key={skill}
                        className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/admin/identity"
        className="inline-block text-sm font-semibold text-emerald-700 hover:underline"
      >
        Open identity verification queue
      </Link>
    </div>
  );
}
