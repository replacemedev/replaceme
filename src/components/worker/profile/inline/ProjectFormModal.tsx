"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createWorkerProject,
  updateWorkerProject,
} from "@/actions/worker/profile";
import type { WorkerProject } from "@/types/worker-profile";
import { ProfileModal } from "./ProfileModal";

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  project: WorkerProject | null;
  onSaved: (project: WorkerProject) => void;
}

const currentYear = new Date().getFullYear();

function parseSkillsInput(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProjectFormModal({
  open,
  onClose,
  project,
  onSaved,
}: ProjectFormModalProps) {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setRole(project.role);
      setYear(String(project.year));
      setDescription(project.description);
      setSkillsInput(project.skills_used.join(", "));
    } else {
      setTitle("");
      setRole("");
      setYear(String(currentYear));
      setDescription("");
      setSkillsInput("");
    }
  }, [project, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const skillsUsed = parseSkillsInput(skillsInput);
    const payload = {
      title,
      role,
      year: Number(year),
      description,
      skillsUsed,
    };

    startTransition(async () => {
      if (project) {
        const result = await updateWorkerProject({ id: project.id, ...payload });
        if (result.error) {
          toast.error(result.error);
          return;
        }
        onSaved({ ...project, ...payload, skills_used: skillsUsed });
        toast.success("Project updated");
      } else {
        const result = await createWorkerProject(payload);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        onSaved({
          id: result.id,
          worker_id: "",
          title,
          role,
          year: Number(year),
          description,
          skills_used: skillsUsed,
        });
        toast.success("Project added");
      }
      onClose();
    });
  }

  return (
    <ProfileModal
      open={open}
      title={project ? "Edit project" : "Add project"}
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
            form="project-form"
            disabled={isPending}
            className="rounded-xl bg-[#006e2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#005c26] disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save project"}
          </button>
        </div>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Project title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Your role
          <input
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Year
          <input
            required
            type="number"
            min={1970}
            max={currentYear + 1}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
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
