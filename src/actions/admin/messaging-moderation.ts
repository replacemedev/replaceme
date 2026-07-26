"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction, suspendUser } from "@/actions/admin-actions";
import { requireAdmin } from "@/lib/server/auth/require-admin";
import { formatFullName } from "@/lib/format/name";
import {
  CHAT_MODERATION_REASON_CODES,
  CHAT_MODERATION_STATUSES,
  formatChatModerationReason,
  violationToChatReason,
  type ChatModerationReasonCode,
  type ChatModerationSource,
  type ChatModerationStatus,
} from "@/lib/reporting/messaging-moderation";
import { USER_REPORT_VIOLATIONS } from "@/lib/reporting/constants";
import { rateLimitReportSubmission } from "@/lib/server/rate-limit";
import { getSession } from "@/lib/server/auth/session";
import { createAdminClient } from "@/lib/supabase/server";
import type { AdminChatModerationFlagRow } from "@/types/admin.types";
import { safeError } from "@/utils/logger";

type ActionResult = { success: true } | { success: false; error: string };

function actionError(err: unknown, fallback: string): string {
  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

const dismissFlagSchema = z.object({
  flagId: z.string().uuid(),
  notes: z.string().trim().min(3).max(1000),
});

const updateFlagStatusSchema = z.object({
  flagId: z.string().uuid(),
  status: z.enum(["open", "investigating", "dismissed", "resolved"]),
  notes: z.string().trim().max(1000).optional(),
});

const reportThreadSchema = z.object({
  threadId: z.string().uuid(),
  violationCategory: z.enum(USER_REPORT_VIOLATIONS),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
});

export async function fetchAdminModerationFlags(
  statusFilter: ChatModerationStatus | "active" = "active"
): Promise<AdminChatModerationFlagRow[]> {
  await requireAdmin();
  const admin = await createAdminClient();

  let query = admin
    .from("chat_moderation_flags")
    .select(
      `
      id,
      thread_id,
      flagged_message_id,
      source,
      reason_code,
      status,
      created_at,
      updated_at,
      chat_threads!inner (
        id,
        worker_id,
        updated_at,
        jobs ( title ),
        company_profiles ( company_name, employer_id ),
        profiles!chat_threads_worker_id_fkey ( first_name, middle_name, last_name, is_verified )
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (statusFilter === "active") {
    query = query.in("status", ["open", "investigating"]);
  } else {
    query = query.eq("status", statusFilter);
  }

  const { data: flags, error } = await query;
  if (error) throw new Error(error.message);
  if (!flags?.length) return [];

  const threadIds = [
    ...new Set(flags.map((f) => f.thread_id).filter(Boolean)),
  ] as string[];

  const { data: messages } = await admin
    .from("chat_messages")
    .select("thread_id, created_at")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: false });

  const stats = new Map<string, { count: number; last: string | null }>();
  for (const msg of messages ?? []) {
    const current = stats.get(msg.thread_id) ?? { count: 0, last: null };
    current.count += 1;
    if (!current.last) current.last = msg.created_at;
    stats.set(msg.thread_id, current);
  }

  return flags.map((flag) => {
    const thread = Array.isArray(flag.chat_threads)
      ? flag.chat_threads[0]
      : flag.chat_threads;
    const worker = Array.isArray(thread?.profiles)
      ? thread?.profiles[0]
      : thread?.profiles;
    const company = Array.isArray(thread?.company_profiles)
      ? thread?.company_profiles[0]
      : thread?.company_profiles;
    const job = Array.isArray(thread?.jobs) ? thread?.jobs[0] : thread?.jobs;
    const meta = stats.get(flag.thread_id);

    return {
      flag_id: flag.id,
      thread_id: flag.thread_id,
      worker_id: thread?.worker_id ?? "",
      worker_name:
        formatFullName(
          worker?.first_name,
          worker?.middle_name,
          worker?.last_name
        ) || null,
      worker_is_verified: Boolean(worker?.is_verified),
      employer_user_id: company?.employer_id ?? null,
      company_name: company?.company_name ?? null,
      job_title: job?.title ?? null,
      source: flag.source as ChatModerationSource,
      reason_code: flag.reason_code as ChatModerationReasonCode,
      status: flag.status as ChatModerationStatus,
      flagged_message_id: flag.flagged_message_id,
      message_count: meta?.count ?? 0,
      last_message_at: meta?.last ?? null,
      created_at: flag.created_at,
      updated_at: flag.updated_at,
    };
  });
}

export type AdminModerationThreadMessage = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_flagged: boolean;
};

export type AdminModerationThreadDetail = {
  threadId: string;
  flagId: string;
  reasonLabel: string;
  source: ChatModerationSource;
  reasonCode: ChatModerationReasonCode;
  status: ChatModerationStatus;
  flaggedMessageId: string | null;
  workerId: string;
  workerName: string | null;
  employerUserId: string | null;
  companyName: string | null;
  jobTitle: string | null;
  messages: AdminModerationThreadMessage[];
};

export async function fetchAdminModerationThread(
  threadId: string,
  flagId?: string | null
): Promise<AdminModerationThreadDetail | null> {
  await requireAdmin();
  const admin = await createAdminClient();
  const tid = z.string().uuid().parse(threadId);

  let flagQuery = admin
    .from("chat_moderation_flags")
    .select(
      `
      id,
      thread_id,
      flagged_message_id,
      source,
      reason_code,
      status,
      chat_threads!inner (
        id,
        worker_id,
        jobs ( title ),
        company_profiles ( company_name, employer_id ),
        profiles!chat_threads_worker_id_fkey ( first_name, middle_name, last_name )
      )
    `
    )
    .eq("thread_id", tid)
    .order("created_at", { ascending: false })
    .limit(1);

  if (flagId) {
    flagQuery = admin
      .from("chat_moderation_flags")
      .select(
        `
        id,
        thread_id,
        flagged_message_id,
        source,
        reason_code,
        status,
        chat_threads!inner (
          id,
          worker_id,
          jobs ( title ),
          company_profiles ( company_name, employer_id ),
          profiles!chat_threads_worker_id_fkey ( first_name, middle_name, last_name )
        )
      `
      )
      .eq("id", z.string().uuid().parse(flagId))
      .eq("thread_id", tid)
      .limit(1);
  }

  const { data: flagRows, error: flagError } = await flagQuery;
  if (flagError) throw new Error(flagError.message);

  const flag = flagRows?.[0];
  if (!flag) return null;

  // Justified-cause gate: only allow review when a flag exists for this thread.
  const thread = Array.isArray(flag.chat_threads)
    ? flag.chat_threads[0]
    : flag.chat_threads;
  const worker = Array.isArray(thread?.profiles)
    ? thread?.profiles[0]
    : thread?.profiles;
  const company = Array.isArray(thread?.company_profiles)
    ? thread?.company_profiles[0]
    : thread?.company_profiles;
  const job = Array.isArray(thread?.jobs) ? thread?.jobs[0] : thread?.jobs;

  const { data: messages, error: msgError } = await admin
    .from("chat_messages")
    .select("id, sender_id, content, created_at")
    .eq("thread_id", tid)
    .order("created_at", { ascending: true })
    .limit(500);

  if (msgError) throw new Error(msgError.message);

  const flaggedIds = new Set(
    [flag.flagged_message_id].filter(Boolean) as string[]
  );

  // Mark any other open flags' messages as highlighted too.
  const { data: siblingFlags } = await admin
    .from("chat_moderation_flags")
    .select("flagged_message_id")
    .eq("thread_id", tid)
    .in("status", ["open", "investigating"]);

  for (const s of siblingFlags ?? []) {
    if (s.flagged_message_id) flaggedIds.add(s.flagged_message_id);
  }

  await logAdminAction("messaging.view_thread", "chat_thread", tid, {
    flag_id: flag.id,
    reason_code: flag.reason_code,
    source: flag.source,
    reason_label: formatChatModerationReason(
      flag.source as ChatModerationSource,
      flag.reason_code as ChatModerationReasonCode
    ),
  });

  // Auto-move open → investigating on first view
  if (flag.status === "open") {
    await admin
      .from("chat_moderation_flags")
      .update({ status: "investigating" })
      .eq("id", flag.id)
      .eq("status", "open");
  }

  return {
    threadId: tid,
    flagId: flag.id,
    reasonLabel: formatChatModerationReason(
      flag.source as ChatModerationSource,
      flag.reason_code as ChatModerationReasonCode
    ),
    source: flag.source as ChatModerationSource,
    reasonCode: flag.reason_code as ChatModerationReasonCode,
    status:
      flag.status === "open"
        ? "investigating"
        : (flag.status as ChatModerationStatus),
    flaggedMessageId: flag.flagged_message_id,
    workerId: thread?.worker_id ?? "",
    workerName:
      formatFullName(
        worker?.first_name,
        worker?.middle_name,
        worker?.last_name
      ) || null,
    employerUserId: company?.employer_id ?? null,
    companyName: company?.company_name ?? null,
    jobTitle: job?.title ?? null,
    messages: (messages ?? []).map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      content: m.content,
      created_at: m.created_at,
      is_flagged: flaggedIds.has(m.id),
    })),
  };
}

export async function dismissModerationFlag(input: {
  flagId: string;
  notes: string;
}): Promise<ActionResult> {
  try {
    const parsed = dismissFlagSchema.parse(input);
    const { user } = await requireAdmin();
    const admin = await createAdminClient();

    const { error } = await admin
      .from("chat_moderation_flags")
      .update({
        status: "dismissed",
        admin_notes: parsed.notes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", parsed.flagId);

    if (error) return { success: false, error: error.message };

    await logAdminAction(
      "messaging.dismiss_flag",
      "chat_moderation_flag",
      parsed.flagId,
      { notes: parsed.notes }
    );
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (err) {
    return { success: false, error: actionError(err, "Failed to dismiss flag") };
  }
}

export async function updateModerationFlagStatus(input: {
  flagId: string;
  status: ChatModerationStatus;
  notes?: string;
}): Promise<ActionResult> {
  try {
    const parsed = updateFlagStatusSchema.parse(input);
    const { user } = await requireAdmin();
    const admin = await createAdminClient();

    const { error } = await admin
      .from("chat_moderation_flags")
      .update({
        status: parsed.status,
        admin_notes: parsed.notes?.trim() || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", parsed.flagId);

    if (error) return { success: false, error: error.message };

    await logAdminAction(
      "messaging.update_flag_status",
      "chat_moderation_flag",
      parsed.flagId,
      { status: parsed.status, notes: parsed.notes ?? null }
    );
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: actionError(err, "Failed to update flag status"),
    };
  }
}

export async function reportMessagingThread(payload: unknown): Promise<{
  success?: true;
  error?: string;
}> {
  try {
    const parsed = reportThreadSchema.safeParse(payload);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid report" };
    }

    const ctx = await getSession();
    if (!ctx) return { error: "Unauthorized" };

    const rate = await rateLimitReportSubmission(ctx.user.id);
    if (!rate.success) return { error: rate.error };

    const { data: thread, error: threadError } = await ctx.supabase
      .from("chat_threads")
      .select(`id, worker_id, job_id, company_profiles ( employer_id )`)
      .eq("id", parsed.data.threadId)
      .single();

    if (threadError || !thread) return { error: "Thread not found" };

    const cp = thread.company_profiles as
      | { employer_id: string }
      | { employer_id: string }[]
      | null;
    const employerId = Array.isArray(cp) ? cp[0]?.employer_id : cp?.employer_id;

    if (thread.worker_id !== ctx.user.id && employerId !== ctx.user.id) {
      return { error: "Access denied" };
    }

    const reportedUserId =
      ctx.user.id === thread.worker_id ? employerId : thread.worker_id;

    if (!reportedUserId) return { error: "Could not identify reported party" };
    if (reportedUserId === ctx.user.id) {
      return { error: "You cannot report yourself" };
    }

    const admin = await createAdminClient();

    const { data: report, error: reportError } = await admin
      .from("user_reports")
      .insert({
        reporter_id: ctx.user.id,
        reported_user_id: reportedUserId,
        job_id: thread.job_id,
        thread_id: parsed.data.threadId,
        violation_category: parsed.data.violationCategory,
        title: parsed.data.title,
        description: parsed.data.description,
        status: "open",
      })
      .select("id")
      .single();

    if (reportError || !report) {
      safeError("reportMessagingThread user_reports:", reportError);
      return { error: "Failed to submit report" };
    }

    const reasonCode = violationToChatReason(parsed.data.violationCategory);
    if (!CHAT_MODERATION_REASON_CODES.includes(reasonCode)) {
      return { error: "Invalid reason" };
    }

    const { error: flagError } = await admin.from("chat_moderation_flags").insert({
      thread_id: parsed.data.threadId,
      source: "user_report",
      reason_code: reasonCode,
      status: "open",
      reporter_id: ctx.user.id,
      user_report_id: report.id,
    });

    if (flagError) {
      safeError("reportMessagingThread flag:", flagError);
      return { error: "Failed to queue for moderation" };
    }

    revalidatePath("/admin/moderation");
    revalidatePath("/admin/reports");
    return { success: true };
  } catch (err) {
    safeError("reportMessagingThread:", err);
    return { error: "Something went wrong" };
  }
}

export { CHAT_MODERATION_STATUSES };
