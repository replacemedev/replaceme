"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X, Search } from "lucide-react";
import { ORDERED_SKILLS, PRIORITY_SKILLS } from "@/data/skills";

const MAX_SKILLS = 5;
const prioritySet = new Set(PRIORITY_SKILLS as readonly string[]);

interface SkillSelectDropdownProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

export function SkillSelectDropdown({
  value,
  onChange,
  placeholder = "Search skills...",
  disabled = false,
  label,
  hint,
}: SkillSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = ORDERED_SKILLS.filter(
    (s) =>
      !value.includes(s) &&
      s.toLowerCase().includes(search.toLowerCase())
  );

  const priorityFiltered = filtered.filter((s) => prioritySet.has(s));
  const otherFiltered = filtered.filter((s) => !prioritySet.has(s));

  const toggleSkill = useCallback(
    (skill: string) => {
      if (value.includes(skill)) {
        onChange(value.filter((s) => s !== skill));
      } else if (value.length < MAX_SKILLS) {
        onChange([...value, skill]);
        setSearch("");
      }
    },
    [value, onChange]
  );

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAtMax = value.length >= MAX_SKILLS;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {hint && <span className="ml-1 text-xs font-normal text-slate-500">({hint})</span>}
        </label>
      )}

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                disabled={disabled}
                className="rounded-full hover:bg-emerald-200 p-0.5 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div ref={containerRef} className="relative">
        <div
          className={[
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors",
            isOpen
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-slate-200 hover:border-slate-300",
            disabled || isAtMax ? "bg-slate-50 cursor-not-allowed opacity-60" : "bg-white cursor-text",
          ].join(" ")}
          onClick={() => {
            if (!disabled && !isAtMax) {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
        >
          <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => !isAtMax && setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
                setSearch("");
              }
            }}
            placeholder={isAtMax ? `Maximum ${MAX_SKILLS} skills selected` : placeholder}
            disabled={disabled || isAtMax}
            className="flex-1 bg-transparent outline-none placeholder:text-slate-400"
            aria-label="Search and select skills"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
            aria-autocomplete="list"
          />
          <ChevronDown
            className={[
              "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden
          />
        </div>

        {/* Dropdown */}
        {isOpen && !isAtMax && (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
            role="listbox"
            aria-label="Available skills"
          >
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">No skills found</p>
            ) : (
              <>
                {priorityFiltered.length > 0 && (
                  <>
                    <div className="sticky top-0 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Popular
                    </div>
                    {priorityFiltered.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        role="option"
                        aria-selected={value.includes(skill)}
                        onClick={() => toggleSkill(skill)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                      >
                        {skill}
                      </button>
                    ))}
                  </>
                )}
                {otherFiltered.length > 0 && (
                  <>
                    {priorityFiltered.length > 0 && (
                      <div className="sticky top-0 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 border-t border-t-slate-100">
                        All Skills
                      </div>
                    )}
                    {otherFiltered.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        role="option"
                        aria-selected={value.includes(skill)}
                        onClick={() => toggleSkill(skill)}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {skill}
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Counter */}
      <p className={["text-xs", isAtMax ? "text-amber-600 font-semibold" : "text-slate-500"].join(" ")}>
        {value.length}/{MAX_SKILLS} skills selected
        {isAtMax && " — remove one to add another"}
      </p>
    </div>
  );
}
