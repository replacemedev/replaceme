"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createJobExperience,
  updateJobExperience,
} from "@/actions/worker/profile";
import type { JobExperience } from "@/types/worker-profile";
import { ProfileModal } from "./ProfileModal";

interface JobExperienceFormModalProps {
  open: boolean;
  onClose: () => void;
  experience: JobExperience | null;
  onSaved: (experience: JobExperience) => void;
}

function parseSkillsInput(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function JobExperienceFormModal({
  open,
  onClose,
  experience,
  onSaved,
}: JobExperienceFormModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (experience) {
      setCompanyName(experience.company_name);
      setRoleTitle(experience.role_title);
      setStartDate(experience.start_date);
      setEndDate(experience.end_date ?? "");
      setDescription(experience.description);
      setSkillsInput(experience.skills_used.join(", "));
    } else {
      setCompanyName("");
      setRoleTitle("");
      setStartDate("");
      setEndDate("");
      setDescription("");
      setSkillsInput("");
    }
  }, [experience, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const skillsUsed = parseSkillsInput(skillsInput);
    const payload = {
      companyName,
      roleTitle,
      startDate,
      endDate: endDate.trim() ? endDate : null,
      description,
      skillsUsed,
    };

    startTransition(async () => {
      if (experience) {
        const result = await updateJobExperience({ id: experience.id, ...payload });
        if (result.error) {
          toast.error(result.error);
          return;
        }
        onSaved({
          ...experience,
          company_name: companyName,
          role_title: roleTitle,
          start_date: startDate,
          end_date: endDate.trim() ? endDate : null,
          description,
          skills_used: skillsUsed,
        });
        toast.success("Experience updated");
      } else {
        const result = await createJobExperience(payload);
        if (result.error || !result.id) {
          toast.error(result.error ?? "Failed to add experience.");
          return;
        }
        onSaved({
          id: result.id,
          worker_id: "",
          company_name: companyName,
          role_title: roleTitle,
          start_date: startDate,
          end_date: endDate.trim() ? endDate : null,
          description,
          skills_used: skillsUsed,
        });
        toast.success("Experience added");
      }
      onClose();
    });
  }

  return (
    <ProfileModal
      open={open}
      title={experience ? "Edit job experience" : "Add job experience"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="job-experience-form"
            disabled={isPending}
            className="rounded-xl bg-[#006e2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#005c26] disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save experience"}
          </button>
        </div>
      }
    >
      <form id="job-experience-form" onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Company name
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Role title
          <input
            required
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Start date
            <input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            End date
            <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Description
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Skills used
          <input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, TypeScript, Figma"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-slate-500">
            Comma-separated list of technologies or skills
          </span>
        </label>
      </form>
    </ProfileModal>
  );
}

/** @deprecated Use JobExperienceFormModal */
export { JobExperienceFormModal as ProjectFormModal };
