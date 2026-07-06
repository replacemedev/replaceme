"use client";

import React, { useState, useTransition } from "react";
import { X, Loader2, Calendar } from "lucide-react";
import { createOrUpdateInterview } from "@/actions/employer/hiring";
import { toast } from "sonner";

interface ScheduleInterviewModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  onSuccess: () => void;
}

export function ScheduleInterviewModal({
  open,
  onClose,
  applicationId,
  candidateName,
  onSuccess,
}: ScheduleInterviewModalProps) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error("Please select a date and time for the interview.");
      return;
    }

    startTransition(async () => {
      const result = await createOrUpdateInterview({
        applicationId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        meetingUrl: meetingUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to schedule interview.");
        return;
      }

      toast.success("Interview scheduled successfully!");
      onSuccess();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-[calc(100vw-2rem)] mx-4 max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Calendar size={16} />
            </span>
            <h3 className="text-base font-extrabold text-slate-800">
              Schedule Interview
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">CANDIDATE</p>
            <p className="text-sm font-black text-slate-900">{candidateName}</p>
          </div>

          <div>
            <label
              htmlFor="scheduledAt"
              className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="scheduledAt"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#006e2f] focus:outline-hidden focus:ring-4 focus:ring-[#006e2f]/10"
            />
          </div>

          <div>
            <label
              htmlFor="meetingUrl"
              className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Meeting Link (Optional)
            </label>
            <input
              type="url"
              id="meetingUrl"
              placeholder="e.g. Zoom, Google Meet, MS Teams link"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#006e2f] focus:outline-hidden focus:ring-4 focus:ring-[#006e2f]/10"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Add Notes for Candidate (Optional)
            </label>
            <textarea
              id="notes"
              placeholder="e.g. Please bring your portfolio, details about the call format..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#006e2f] focus:outline-hidden focus:ring-4 focus:ring-[#006e2f]/10 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Scheduling..." : "Schedule Call"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
