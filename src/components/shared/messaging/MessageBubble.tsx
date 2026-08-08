"use client";

/* Hallmark · pre-emit critique: P4 H4 E5 S4 R5 V4 */

import React, { useState, useTransition } from "react";
import { Briefcase, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ChatMessage } from "@/types/messaging";
import { quickApplyFromChat } from "@/actions/job-application";

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: string;
  /** Workers see Quick Apply on system_match cards; employers do not. */
  showQuickApply?: boolean;
}

type SystemMatchPayload = {
  jobId?: string;
  jobTitle?: string;
  overlappingSkills?: string[];
  matchScore?: number;
  cta?: string;
};

function parseMatchPayload(payload: unknown): SystemMatchPayload {
  if (!payload || typeof payload !== "object") return {};
  const p = payload as Record<string, unknown>;
  return {
    jobId: typeof p.jobId === "string" ? p.jobId : undefined,
    jobTitle: typeof p.jobTitle === "string" ? p.jobTitle : undefined,
    overlappingSkills: Array.isArray(p.overlappingSkills)
      ? p.overlappingSkills.filter((s): s is string => typeof s === "string")
      : [],
    matchScore: typeof p.matchScore === "number" ? p.matchScore : undefined,
    cta: typeof p.cta === "string" ? p.cta : undefined,
  };
}

function SystemMatchCard({
  message,
  formatTime,
  showQuickApply,
}: {
  message: ChatMessage;
  formatTime: (iso: string) => string;
  showQuickApply: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [applied, setApplied] = useState(false);
  const payload = parseMatchPayload(message.payload);
  const jobTitle = payload.jobTitle?.trim() || "Matched role";
  const skills = payload.overlappingSkills ?? [];
  const score =
    typeof payload.matchScore === "number" ? Math.round(payload.matchScore) : null;
  const senderLabel =
    message.sender?.full_name?.trim() || "Skill Match";

  const handleQuickApply = () => {
    if (!payload.jobId) {
      toast.error("Quick Apply is unavailable for this match.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await quickApplyFromChat({
          jobId: payload.jobId!,
          messageId: message.id,
        });
        if (!result.success) {
          toast.error(result.error ?? "Could not submit application.");
          return;
        }
        setApplied(true);
        toast.success("Application submitted.");
      } catch {
        toast.error("Could not submit application.");
      }
    });
  };

  return (
    <div className="flex flex-col items-start w-full mb-6 last:mb-2 max-w-[92%] sm:max-w-[78%] mr-auto">
      <p className="mb-1.5 ml-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700/80">
        {senderLabel}
      </p>
      <div className="w-full overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 via-white to-white shadow-xs">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Skill match
              </p>
              <h3 className="flex items-start gap-2 text-base font-bold text-slate-900 sm:text-lg">
                <Briefcase
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <span className="min-w-0 break-words">{jobTitle}</span>
              </h3>
              {message.content ? (
                <p className="text-sm leading-relaxed text-slate-600">
                  {message.content}
                </p>
              ) : null}
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-emerald-100/80 pt-3 sm:flex-row sm:items-center sm:justify-between">
              {score != null ? (
                <p className="text-sm font-semibold text-slate-700">
                  Match score{" "}
                  <span className="font-extrabold text-emerald-700">{score}%</span>
                </p>
              ) : (
                <span className="hidden sm:block" />
              )}
              {showQuickApply && payload.cta === "quick_apply" ? (
                <button
                  type="button"
                  onClick={handleQuickApply}
                  disabled={isPending || applied || !payload.jobId}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {applied ? "Applied" : isPending ? "Applying…" : "Quick Apply"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 ml-1 flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-400">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}

export function MessageBubble({
  message,
  currentUserId,
  showQuickApply = false,
}: MessageBubbleProps) {
  const isSystemMatch = message.message_kind === "system_match";
  const isMe = Boolean(message.sender_id) && message.sender_id === currentUserId;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const renderParsedContent = (content: string) => {
    const sections = content.split(/\n\n+/);

    return sections.map((section, idx) => {
      const trimmed = section.trim();

      if (
        trimmed.toLowerCase().includes("email subject format:") ||
        (trimmed.startsWith("[") && trimmed.includes("] - [") && trimmed.endsWith("]"))
      ) {
        return (
          <div
            key={idx}
            className="my-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[12px] text-slate-700 leading-relaxed select-all"
          >
            {trimmed.split("\n").map((line, lidx) => (
              <div key={lidx}>{line}</div>
            ))}
          </div>
        );
      }

      if (
        trimmed.toUpperCase().includes("FULL NAME:") ||
        trimmed.toUpperCase().includes("JOB POSITION YOU APPLIED FOR:")
      ) {
        return (
          <div
            key={idx}
            className="my-3 p-4 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap select-all"
          >
            {trimmed}
          </div>
        );
      }

      const lines = trimmed.split("\n");
      return (
        <p key={idx} className="text-[14px] leading-relaxed text-slate-700 font-medium mb-3 last:mb-0">
          {lines.map((line, lidx) => {
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
            const urlRegex = /(https?:\/\/[^\s]+)/gi;

            let parsedLine: React.ReactNode = line;

            if (emailRegex.test(line)) {
              const parts = line.split(emailRegex);
              parsedLine = parts.map((part, pidx) => {
                if (emailRegex.test(part)) {
                  return (
                    <a
                      key={pidx}
                      href={`mailto:${part}`}
                      className="text-[#006e2f] hover:underline font-semibold"
                    >
                      {part}
                    </a>
                  );
                }
                return part;
              });
            } else if (urlRegex.test(line)) {
              const parts = line.split(urlRegex);
              parsedLine = parts.map((part, pidx) => {
                if (urlRegex.test(part)) {
                  return (
                    <a
                      key={pidx}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#006e2f] hover:underline font-semibold"
                    >
                      {part}
                    </a>
                  );
                }
                return part;
              });
            }

            return (
              <React.Fragment key={lidx}>
                {parsedLine}
                {lidx < lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </p>
      );
    });
  };

  if (isSystemMatch) {
    return (
      <SystemMatchCard
        message={message}
        formatTime={formatTime}
        showQuickApply={showQuickApply}
      />
    );
  }

  if (isMe) {
    return (
      <div className="flex flex-col items-end w-full mb-6 last:mb-2 max-w-[85%] sm:max-w-[70%] ml-auto">
        <div className="w-full bg-[#e8f5e9]/55 border border-[#c8e6c9]/40 rounded-2xl p-5 shadow-xs">
          {renderParsedContent(message.content)}
        </div>

        <div className="flex items-center gap-1.5 mt-2 mr-1">
          <span className="text-[11px] font-semibold text-slate-400">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    );
  }

  const otherLabel =
    message.sender_id == null
      ? "Replaceme"
      : message.sender?.full_name?.trim() || null;

  return (
    <div className="flex flex-col items-start w-full mb-6 last:mb-2 max-w-[85%] sm:max-w-[72%] mr-auto">
      {otherLabel ? (
        <p className="mb-1.5 ml-1 text-[11px] font-semibold text-slate-500">
          {otherLabel}
        </p>
      ) : null}
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        {renderParsedContent(message.content)}
      </div>

      <div className="flex items-center gap-1.5 mt-2 ml-1">
        <span className="text-[11px] font-semibold text-slate-400">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
