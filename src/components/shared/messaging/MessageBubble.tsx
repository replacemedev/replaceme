"use client";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 */

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
  /** Same sender as the previous bubble in the thread (tighter stack). */
  isConsecutive?: boolean;
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
  isConsecutive,
}: {
  message: ChatMessage;
  formatTime: (iso: string) => string;
  showQuickApply: boolean;
  isConsecutive: boolean;
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
    <div
      className={`flex w-full max-w-[85%] flex-col items-start mr-auto sm:max-w-md ${
        isConsecutive ? "mb-2" : "mb-4"
      } last:mb-1`}
    >
      {!isConsecutive ? (
        <p className="mb-1 ml-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700/80">
          {senderLabel}
        </p>
      ) : null}
      <div className="w-full overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 via-white to-white shadow-xs">
        <div className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-start sm:gap-3 sm:p-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Skill match
              </p>
              <h3 className="flex items-start gap-1.5 text-sm font-semibold text-slate-900 sm:text-base">
                <Briefcase
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <span className="min-w-0 break-words">{jobTitle}</span>
              </h3>
              {message.content ? (
                <p className="text-xs leading-snug text-slate-600 sm:text-[13px]">
                  {message.content}
                </p>
              ) : null}
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 border-t border-emerald-100/80 pt-2 sm:flex-row sm:items-center sm:justify-between">
              {score != null ? (
                <p className="text-xs font-semibold text-slate-700">
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
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {applied ? "Applied" : isPending ? "Applying…" : "Quick Apply"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-1 ml-1 flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-400">
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
  isConsecutive = false,
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
            className="my-1.5 rounded-lg border border-slate-200/60 bg-slate-50 p-2.5 font-mono text-[11px] leading-snug text-slate-700 select-all"
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
            className="my-1.5 whitespace-pre-wrap rounded-lg border border-slate-200/60 bg-slate-50 p-2.5 font-mono text-[11px] leading-snug text-slate-700 select-all"
          >
            {trimmed}
          </div>
        );
      }

      const lines = trimmed.split("\n");
      return (
        <p
          key={idx}
          className="mb-1.5 text-[13px] font-medium leading-snug text-slate-700 last:mb-0 sm:text-sm"
        >
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
                      className="font-semibold text-[#006e2f] hover:underline"
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
                      className="font-semibold text-[#006e2f] hover:underline"
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
        isConsecutive={isConsecutive}
      />
    );
  }

  const stackGap = isConsecutive ? "mb-2" : "mb-4";

  if (isMe) {
    return (
      <div
        className={`ml-auto flex w-fit max-w-[85%] flex-col items-end sm:max-w-[70%] ${stackGap} last:mb-1`}
      >
        <div className="w-fit max-w-full rounded-2xl border border-[#c8e6c9]/40 bg-[#e8f5e9]/55 px-3.5 py-2 shadow-xs">
          {renderParsedContent(message.content)}
        </div>

        <div className="mt-1 mr-1 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400">
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
    <div
      className={`mr-auto flex w-fit max-w-[85%] flex-col items-start sm:max-w-[72%] ${stackGap} last:mb-1`}
    >
      {!isConsecutive && otherLabel ? (
        <p className="mb-1 ml-1 text-[10px] font-semibold text-slate-500">
          {otherLabel}
        </p>
      ) : null}
      <div className="w-fit max-w-full rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 shadow-xs">
        {renderParsedContent(message.content)}
      </div>

      <div className="mt-1 ml-1 flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-400">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
