"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { reportWorker } from "@/actions/employer/report-worker";
import {
  USER_REPORT_VIOLATIONS,
  USER_REPORT_VIOLATION_LABELS,
  type UserReportViolation,
} from "@/lib/reporting/constants";

const inputClassName =
  "mt-1.5 w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors placeholder:text-slate-400 focus:border-[#006e2f]/50 focus:outline-hidden focus:ring-2 focus:ring-[#006e2f]/15";

export function ReportWorkerCard() {
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [violationCategory, setViolationCategory] =
    useState<UserReportViolation>("harassment");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await reportWorker({
        title,
        description,
        workerId: workerId.trim(),
        violationCategory,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Report submitted confidentially");
      setTitle("");
      setDescription("");
      setWorkerId("");
      setViolationCategory("harassment");
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6"
    >
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
          Report Worker
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          Flag fraud, harassment, or policy violations. Your identity stays
          confidential from the worker.
        </p>
      </div>
      <label className="block text-sm font-semibold text-slate-700">
        Violation category
        <select
          value={violationCategory}
          onChange={(e) =>
            setViolationCategory(e.target.value as UserReportViolation)
          }
          className={inputClassName}
        >
          {USER_REPORT_VIOLATIONS.map((v) => (
            <option key={v} value={v}>
              {USER_REPORT_VIOLATION_LABELS[v]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Worker account ID
        <input
          required
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          placeholder="UUID from the worker profile or hire record"
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Subject
        <input
          required
          minLength={5}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Details
        <textarea
          required
          minLength={10}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClassName} min-h-[7.5rem] resize-y`}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-900 disabled:opacity-60 sm:w-auto"
      >
        Submit report
      </button>
    </form>
  );
}
