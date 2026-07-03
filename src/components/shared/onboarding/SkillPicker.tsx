"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";

interface SkillPickerProps {
  label: string;
  hint?: string;
  options: readonly string[];
  value: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  disabled?: boolean;
}

function normalizeSkill(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function SkillPicker({
  label,
  hint,
  options,
  value,
  onChange,
  maxSkills = 8,
  disabled = false,
}: SkillPickerProps) {
  const [customSkill, setCustomSkill] = useState("");

  const addSkill = (raw: string) => {
    const skill = normalizeSkill(raw);
    if (!skill) return;

    const exists = value.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (exists || value.length >= maxSkills) return;

    onChange([...value, skill]);
    setCustomSkill("");
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
  };

  const togglePreset = (skill: string) => {
    if (value.includes(skill)) {
      removeSkill(skill);
      return;
    }
    addSkill(skill);
  };

  const handleCustomKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill(customSkill);
    }
  };

  const atMax = value.length >= maxSkills;

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-slate-700">{label}</legend>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary max-w-full"
            >
              <span className="truncate">{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="rounded-full p-0.5 hover:bg-primary/15 shrink-0"
                aria-label={`Remove ${skill}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          type="text"
          value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          placeholder="Add your own skill"
          disabled={atMax}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => addSkill(customSkill)}
          disabled={atMax || !customSkill.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:px-4"
        >
          <Plus size={14} className="shrink-0" />
          <span className="hidden min-[400px]:inline">Add</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((skill) => {
          const selected = value.includes(skill);
          const presetDisabled = !selected && atMax;
          return (
            <button
              key={skill}
              type="button"
              onClick={() => togglePreset(skill)}
              disabled={presetDisabled}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors truncate max-w-full ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 text-slate-600 hover:border-primary/30 hover:text-primary"
              } ${presetDisabled ? "cursor-not-allowed opacity-40" : ""}`}
            >
              {skill}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        {value.length}/{maxSkills} selected
      </p>
    </fieldset>
  );
}
