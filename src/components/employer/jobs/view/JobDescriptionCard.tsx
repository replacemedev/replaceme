"use client";

import React from "react";

interface JobDescriptionCardProps {
  description: string;
  requiredSkills: string[];
}

export function JobDescriptionCard({
  description,
  requiredSkills,
}: JobDescriptionCardProps) {
  return (
    <div className="space-y-8">
      {/* Job Description Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Job Description</h2>
        </div>

        <div className="text-sm text-slate-600 leading-relaxed space-y-4">
          {description.split("\n\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>

      {/* Requirements & Skills Card */}
      {requiredSkills.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Required Skills</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {requiredSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
