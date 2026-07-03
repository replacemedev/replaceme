"use client";

import React from "react";

interface JobDescriptionCardProps {
  description: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  experienceAndEducation: string[];
}

export function JobDescriptionCard({
  description,
  keyResponsibilities,
  requiredSkills,
  experienceAndEducation,
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

        {keyResponsibilities.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Key Responsibilities</h3>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
              {keyResponsibilities.map((resp, idx) => (
                <li key={idx} className="leading-relaxed">
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Requirements & Skills Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Requirements & Skills</h2>
        </div>

        {requiredSkills.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Required Skills</h3>
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

        {experienceAndEducation.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Experience & Education</h3>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
              {experienceAndEducation.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
