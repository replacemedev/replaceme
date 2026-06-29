"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createWorkerSkill,
  updateWorkerSkill,
  deleteWorkerSkill,
} from "@/actions/worker/profile";
import { PROFICIENCY_OPTIONS } from "@/lib/validations/worker/profile-inline";
import type { WorkerSkillDetailed } from "@/types/worker-profile";
import { ProfileModal } from "./ProfileModal";

interface SkillsManageModalProps {
  open: boolean;
  onClose: () => void;
  skills: WorkerSkillDetailed[];
  onSkillsChange: (skills: WorkerSkillDetailed[]) => void;
}

const EMPTY_FORM = {
  skillName: "",
  proficiency: 75,
  proficiencyLabel: "Proficient",
  experienceDuration: "",
};

export function SkillsManageModal({
  open,
  onClose,
  skills,
  onSkillsChange,
}: SkillsManageModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleProficiencyChange(value: number) {
    const label =
      PROFICIENCY_OPTIONS.find((o) => o.value === value)?.label ?? "Proficient";
    setForm((f) => ({ ...f, proficiency: value, proficiencyLabel: label }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (editingId) {
        const result = await updateWorkerSkill({
          id: editingId,
          skillName: form.skillName,
          proficiency: form.proficiency,
          proficiencyLabel: form.proficiencyLabel,
          category: "top",
          experienceDuration: form.experienceDuration || undefined,
        });
        if (result.error) {
          toast.error(result.error);
          return;
        }
        onSkillsChange(
          skills.map((s) =>
            s.id === editingId
              ? {
                  ...s,
                  skill_name: form.skillName,
                  proficiency: form.proficiency,
                  proficiency_label: form.proficiencyLabel,
                  experience_duration: form.experienceDuration || null,
                }
              : s
          )
        );
        toast.success("Skill updated");
      } else {
        const result = await createWorkerSkill({
          skillName: form.skillName,
          proficiency: form.proficiency,
          proficiencyLabel: form.proficiencyLabel,
          category: "top",
          experienceDuration: form.experienceDuration || undefined,
        });
        if (result.error) {
          toast.error(result.error);
          return;
        }
        const optimistic: WorkerSkillDetailed = {
          id: result.id,
          worker_id: "",
          skill_name: form.skillName,
          proficiency: form.proficiency,
          category: "top",
          experience_duration: form.experienceDuration || null,
          proficiency_label: form.proficiencyLabel,
        };
        onSkillsChange([optimistic, ...skills]);
        toast.success("Skill added");
      }
      resetForm();
    });
  }

  function handleDelete(skillId: string) {
    startTransition(async () => {
      const result = await deleteWorkerSkill(skillId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onSkillsChange(skills.filter((s) => s.id !== skillId));
      if (editingId === skillId) resetForm();
      toast.success("Skill removed");
    });
  }

  function startEdit(skill: WorkerSkillDetailed) {
    setEditingId(skill.id);
    setForm({
      skillName: skill.skill_name,
      proficiency: skill.proficiency,
      proficiencyLabel: skill.proficiency_label ?? "Proficient",
      experienceDuration: skill.experience_duration ?? "",
    });
  }

  return (
    <ProfileModal
      open={open}
      title="Manage top skills"
      onClose={() => {
        resetForm();
        onClose();
      }}
      footer={
        <p className="text-xs text-slate-500">
          Skills appear on your public profile with proficiency bars.
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-slate-700">
          Skill name
          <input
            required
            value={form.skillName}
            onChange={(e) => setForm({ ...form, skillName: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="e.g. React"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Proficiency
          <select
            value={form.proficiency}
            onChange={(e) => handleProficiencyChange(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {PROFICIENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Experience (optional)
          <input
            value={form.experienceDuration}
            onChange={(e) =>
              setForm({ ...form, experienceDuration: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="e.g. 1–2 years"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#006e2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#005c26] disabled:opacity-60"
          >
            {editingId ? "Update skill" : "Add skill"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <ul className="space-y-2 border-t border-slate-100 pt-4">
        {skills.length === 0 ? (
          <li className="text-sm text-slate-500 italic">No skills yet.</li>
        ) : (
          skills.map((skill) => (
            <li
              key={skill.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => startEdit(skill)}
                className="text-left text-sm font-bold text-slate-800 hover:text-[#006e2f]"
              >
                {skill.skill_name}
                <span className="block text-[10px] font-semibold text-slate-400">
                  {skill.proficiency_label}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(skill.id)}
                disabled={isPending}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                aria-label={`Delete ${skill.skill_name}`}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))
        )}
      </ul>
    </ProfileModal>
  );
}
