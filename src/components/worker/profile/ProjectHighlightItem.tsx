"use client";

import React from "react";
import type { JobExperience } from "@/types/worker-profile";

interface JobExperienceItemProps {
  experience: JobExperience;
}

function formatDateRange(start: string, end: string | null) {
  const startLabel = start;
  const endLabel = end ?? "Present";
  return `${startLabel} – ${endLabel}`;
}

export function JobExperienceItem({ experience }: JobExperienceItemProps) {
  return (
    <div className="relative pl-6 space-y-1">
      <div className="absolute left-1 top-2.5 w-2 h-2 rounded-full bg-[#006e2f] border border-white ring-2 ring-[#ebfdf2]/60" />

      <div className="space-y-0.5">
        <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">
          {experience.role_title}
        </h4>
        <p className="text-[10px] font-bold text-slate-400">
          {experience.company_name} • {formatDateRange(experience.start_date, experience.end_date)}
        </p>
      </div>

      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl pt-1">
        {experience.description}
      </p>

      {experience.skills_used.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {experience.skills_used.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use JobExperienceItem */
export function ProjectHighlightItem({
  project,
}: {
  project: JobExperience;
}) {
  return <JobExperienceItem experience={project} />;
}
