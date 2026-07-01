import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { AdminWorkerProfileDeepDive } from "@/actions/admin/deep-dive";

interface WorkerDeepDiveViewProps {
  data: AdminWorkerProfileDeepDive;
}

export function WorkerDeepDiveView({ data }: WorkerDeepDiveViewProps) {
  const name =
    [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || "Unnamed worker";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users?tab=workers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to workers
      </Link>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h2 className="text-xl font-bold text-slate-900">{name}</h2>
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
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Location</dt>
              <dd className="text-slate-800">{data.location ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Availability</dt>
              <dd className="text-slate-800">{data.availability ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Hourly rate</dt>
              <dd className="text-slate-800 font-mono">
                {data.hourlyRate != null
                  ? `${data.hourlyRate} ${data.salaryCurrency}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Remote</dt>
              <dd className="text-slate-800">{data.isRemote ? "Yes" : "No"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-400">
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

      {data.projects.length > 0 ? (
        <section className="space-y-4">
          <AdminSectionLabel>Projects</AdminSectionLabel>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.projects.map((project) => (
              <li
                key={project.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              >
                <p className="font-semibold text-slate-900">{project.title}</p>
                <p className="text-xs text-slate-500">
                  {project.role} · {project.year}
                </p>
                <p className="mt-2 text-sm text-slate-700 line-clamp-3">{project.description}</p>
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
