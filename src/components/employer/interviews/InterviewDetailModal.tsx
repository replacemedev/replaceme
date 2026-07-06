"use client";

import React, { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Video, Clock, AlignLeft, Edit, Trash } from "lucide-react";
import { ClientFormattedDate } from "@/components/shared/ClientFormattedDate";
import { createOrUpdateInterview, cancelInterview, updateInterviewSchedule, type EmployerInterviewRow } from "@/actions/employer/hiring";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InterviewDetailModalProps {
  open: boolean;
  onClose: () => void;
  interview: EmployerInterviewRow;
}

export function InterviewDetailModal({
  open,
  onClose,
  interview,
}: InterviewDetailModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [dateVal, setDateVal] = useState(() => {
    const d = new Date(interview.scheduledAt);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [timeVal, setTimeVal] = useState(() => {
    const d = new Date(interview.scheduledAt);
    const hrs = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${hrs}:${mins}`;
  });
  const [meetingUrl, setMeetingUrl] = useState(interview.meetingUrl ?? "");
  const [notes, setNotes] = useState(interview.notes ?? "");
  const [isPending, startTransition] = useTransition();

  if (!open || !mounted) return null;

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateVal || !timeVal) {
      toast.error("Please pick a valid date and time.");
      return;
    }

    const scheduledAt = new Date(`${dateVal}T${timeVal}`).toISOString();

    startTransition(async () => {
      let result;
      if (interview.id) {
        result = await updateInterviewSchedule({
          interviewId: interview.id,
          scheduledAt,
          meetingLink: meetingUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        result = await createOrUpdateInterview({
          applicationId: interview.applicationId,
          scheduledAt,
          meetingUrl: meetingUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      if (!result.success) {
        toast.error(result.error ?? "Failed to reschedule interview.");
        return;
      }

      toast.success("Interview rescheduled successfully.");
      setIsEditing(false);
      router.refresh();
      onClose();
    });
  };

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel this interview? The candidate status will revert to Shortlisted.")) {
      return;
    }

    startTransition(async () => {
      const result = await cancelInterview(interview.applicationId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to cancel interview.");
        return;
      }

      toast.success("Interview cancelled successfully.");
      router.refresh();
      onClose();
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-[calc(100vw-2rem)] mx-4 max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-800">
            {isEditing ? "Reschedule Interview" : "Interview Details"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleReschedule} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="editDateVal"
                  className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5"
                >
                  Date *
                </label>
                <input
                  type="date"
                  id="editDateVal"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-800 focus:border-[#006e2f] focus:outline-hidden focus:ring-4 focus:ring-[#006e2f]/10"
                />
              </div>
              <div>
                <label
                  htmlFor="editTimeVal"
                  className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5"
                >
                  Time *
                </label>
                <input
                  type="time"
                  id="editTimeVal"
                  value={timeVal}
                  onChange={(e) => setTimeVal(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-800 focus:border-[#006e2f] focus:outline-hidden focus:ring-4 focus:ring-[#006e2f]/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="editMeetingUrl"
                className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Meeting Link (Optional)
              </label>
              <input
                type="url"
                id="editMeetingUrl"
                placeholder="Zoom or Google Meet link"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-800 focus:border-[#006e2f] focus:outline-hidden focus:ring-4 focus:ring-[#006e2f]/10"
              />
            </div>

            <div>
              <label
                htmlFor="editNotes"
                className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Notes for Candidate (Optional)
              </label>
              <textarea
                id="editNotes"
                placeholder="Message for candidate"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-800 focus:border-[#006e2f] focus:outline-hidden focus:ring-4 focus:ring-[#006e2f]/10 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 h-11 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 pt-4">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Candidate</p>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{interview.candidateName}</p>
              <p className="text-xs font-semibold text-slate-400">{interview.jobTitle}</p>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mt-0.5">
                <Clock size={16} />
              </span>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date & Time</p>
                <p className="text-sm font-black text-slate-850 mt-0.5">
                  <ClientFormattedDate date={interview.scheduledAt} />
                </p>
              </div>
            </div>

            {interview.meetingUrl && (
              <div className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mt-0.5">
                  <Video size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Meeting link</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 truncate select-all">
                    {interview.meetingUrl}
                  </p>
                </div>
              </div>
            )}

            {interview.notes && (
              <div className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 mt-0.5">
                  <AlignLeft size={16} />
                </span>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Your Notes</p>
                  <p className="text-xs font-semibold text-slate-650 mt-1 whitespace-pre-wrap">
                    {interview.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {interview.meetingUrl && (
                <a
                  href={interview.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-sm transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                >
                  <Video size={16} />
                  Join Meeting
                </a>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 h-10 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit size={14} />
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="flex-1 h-10 border border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash size={14} />}
                  Cancel Call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
