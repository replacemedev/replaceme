"use client";

import { useState, useTransition } from "react";
import { Check, Edit, X } from "lucide-react";
import { toast } from "sonner";

interface InlineEditableRowProps {
  label: string;
  value: string;
  displayValue?: string;
  placeholder?: string;
  inputType?: "text" | "url" | "number";
  editable?: boolean;
  onSave: (value: string) => Promise<{ error?: string } | { success: true }>;
}

export function InlineEditableRow({
  label,
  value,
  displayValue,
  placeholder,
  inputType = "text",
  editable = false,
  onSave,
}: InlineEditableRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [localValue, setLocalValue] = useState(value);
  const [isPending, startTransition] = useTransition();

  const shown = displayValue ?? (localValue || placeholder || "Not specified");

  function startEdit() {
    setDraft(localValue);
    setEditing(true);
  }

  function cancel() {
    setDraft(localValue);
    setEditing(false);
  }

  function save() {
    startTransition(async () => {
      const result = await onSave(draft);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      setLocalValue(draft);
      setEditing(false);
    });
  }

  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-slate-400 shrink-0">{label}</span>
      {editing ? (
        <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
          <input
            type={inputType}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="w-full max-w-[180px] rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-800"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="p-1 text-[#006e2f] hover:bg-[#ebfdf2] rounded-md"
            aria-label="Save"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={isPending}
            className="p-1 text-slate-400 hover:bg-slate-100 rounded-md"
            aria-label="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-slate-800 min-w-0 justify-end">
          <span className="truncate">{shown}</span>
          {editable ? (
            <button
              type="button"
              onClick={startEdit}
              className="text-slate-300 hover:text-slate-500 shrink-0"
              aria-label={`Edit ${label}`}
            >
              <Edit size={12} />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
