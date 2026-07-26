"use server";

import { createClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { getSession } from "@/lib/server/auth/session";
import {
  sendMessageSchema,
  threadActionSchema,
  threadIdSchema,
  togglePinSchema,
  ensureMessagingThreadSchema,
  loadOlderMessagesSchema,
  loadMoreThreadsSchema,
} from "@/lib/validations/messaging";
import { safeError } from "@/utils/logger";
import {
  buildContextTitle,
  extractJobRolesFromThreads,
  MESSAGING_MESSAGES_PAGE_SIZE,
  MESSAGING_THREADS_PAGE_SIZE,
  MessagingJobRole,
  MessagingMessage,
  MessagingMessagesPage,
  MessagingRole,
  MessagingThread,
  MessagingThreadsPage,
  sortThreadsByRecentActivity,
} from "@/types/messaging";
import { revalidatePath } from "next/cache";
import { assertEmployerMessaging, fetchEmployerEntitlements } from "@/lib/server/entitlements";
import type { BillingIdentityMode } from "@/lib/server/entitlements";
import { previewDisplayName } from "@/lib/entitlements/ui-copy";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
  invalidateEmployerMessagingCache,
  invalidateMessagingThreadMessages,
  invalidateWorkerMessagingCache,
} from "@/lib/server/redis-cache";
import {
  employerHasMessagedThread,
  ensureEmployerMessagingThread,
} from "@/lib/server/messaging/ensure-thread";

async function getAuthenticatedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return { supabase, user, profile };
}

type LastMessageRow = {
  content: string;
  created_at: string;
  sender_id: string;
  read_at: string | null;
};

/** Parallel per-thread meta fetches — avoids sequential N+1 waterfalls. */
async function enrichThreads(
  supabase: Awaited<ReturnType<typeof createClient>>,
  threads: Array<Record<string, unknown>>,
  role: MessagingRole,
  currentUserId: string,
  employerIdentityMode: BillingIdentityMode | null = null
): Promise<MessagingThread[]> {
  if (threads.length === 0) return [];

  const threadIds = threads.map((t) => t.id as string);

  const [lastMessagePairs, unreadPairs] = await Promise.all([
    Promise.all(
      threadIds.map(async (id) => {
        const { data } = await supabase
          .from("chat_messages")
          .select("content, created_at, sender_id, read_at")
          .eq("thread_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return [id, (data as LastMessageRow | null) ?? null] as const;
      })
    ),
    Promise.all(
      threadIds.map(async (id) => {
        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("thread_id", id)
          .neq("sender_id", currentUserId)
          .is("read_at", null);
        return [id, count ?? 0] as const;
      })
    ),
  ]);

  const lastByThread = new Map(lastMessagePairs);
  const unreadByThread = new Map(unreadPairs);

  const mapped = threads.map((t) => {
    const jobs = t.jobs as { id: string; title: string } | null;
    const jobTitle = jobs?.title ?? null;
    let oppositeParty: MessagingThread["oppositeParty"];

    if (role === "worker") {
      const company = t.company_profiles as {
        id: string;
        company_name: string;
        logo_url: string | null;
      };
      oppositeParty = {
        id: company.id,
        name: company.company_name,
        avatarUrl: company.logo_url,
      };
    } else {
      const worker = t.worker as {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
        is_verified?: boolean | null;
      };
      const maskIdentity = employerIdentityMode !== "full";
      oppositeParty = {
        id: worker.id,
        name: maskIdentity
          ? previewDisplayName(worker.id)
          : worker.full_name?.trim() || "Worker",
        avatarUrl: maskIdentity ? null : worker.avatar_url,
        isVerified: maskIdentity ? false : Boolean(worker.is_verified),
      };
    }

    const markedUnread =
      role === "worker"
        ? Boolean(t.worker_marked_unread)
        : Boolean(t.employer_marked_unread);

    const id = t.id as string;
    return {
      id,
      worker_id: t.worker_id as string,
      company_profile_id: t.company_profile_id as string,
      job_id: (t.job_id as string) ?? null,
      is_pinned: t.is_pinned as boolean,
      created_at: t.created_at as string,
      updated_at: t.updated_at as string,
      oppositeParty,
      jobTitle,
      contextTitle: buildContextTitle(jobTitle),
      blocked_reason: (t.blocked_reason as string | null) ?? null,
      last_message: lastByThread.get(id) ?? null,
      unread_count: unreadByThread.get(id) ?? 0,
      marked_unread: markedUnread,
    };
  });

  // Inbox order follows last message activity — not thread.updated_at (bumped by
  // read/pin/metadata writes and would jump a conversation on mere selection).
  return sortThreadsByRecentActivity(mapped);
}

/** One query: which threads already have a non-worker (employer) message. */
async function filterThreadsWithEmployerMessages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  threads: Array<Record<string, unknown>>,
  workerId: string
): Promise<Array<Record<string, unknown>>> {
  if (threads.length === 0) return [];

  const withEmployer = threads.filter((thread) => {
    const company = thread.company_profiles as { employer_id: string } | null;
    return Boolean(company?.employer_id);
  });

  if (withEmployer.length === 0) return [];

  const threadIds = withEmployer.map((t) => t.id as string);
  const { data: rows } = await supabase
    .from("chat_messages")
    .select("thread_id")
    .in("thread_id", threadIds)
    .neq("sender_id", workerId);

  const activeIds = new Set((rows ?? []).map((r) => r.thread_id));
  return withEmployer.filter((t) => activeIds.has(t.id as string));
}

async function loadMessagingThreadsPage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: { id: string; role: string },
  role: MessagingRole,
  offset: number,
  limit: number
): Promise<MessagingThreadsPage> {
  // Fetch a wider window so soft-filters (worker: employer-messaged) still fill a page.
  const fetchLimit = Math.min(offset + limit + limit, 200);

  if (role === "worker") {
    const { data: threads, error } = await supabase
      .from("chat_threads")
      .select(
        `*, company_profiles (id, company_name, logo_url, employer_id), jobs (id, title)`
      )
      .eq("worker_id", profile.id)
      .is("worker_deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(fetchLimit);

    if (error) {
      safeError("getMessagingThreads worker:", error);
      return { threads: [], hasMore: false };
    }

    const activeThreads = await filterThreadsWithEmployerMessages(
      supabase,
      threads ?? [],
      profile.id
    );
    const pageSlice = activeThreads.slice(offset, offset + limit);
    const enriched = await enrichThreads(supabase, pageSlice, role, profile.id);
    return {
      threads: enriched,
      hasMore: activeThreads.length > offset + limit,
    };
  }

  const { data: company } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("employer_id", profile.id)
    .single();

  if (!company) return { threads: [], hasMore: false };

  const entitlements = await fetchEmployerEntitlements(profile.id, supabase);
  const identityMode = entitlements?.identityMode ?? "anonymous_preview";

  const { data: threads, error } = await supabase
    .from("chat_threads")
    .select(
      `*, worker:profiles!chat_threads_worker_id_fkey (id, full_name, avatar_url, is_verified), jobs (id, title)`
    )
    .eq("company_profile_id", company.id)
    .is("employer_deleted_at", null)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    safeError("getMessagingThreads employer:", error);
    return { threads: [], hasMore: false };
  }

  const rows = threads ?? [];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const enriched = await enrichThreads(
    supabase,
    pageRows,
    role,
    profile.id,
    identityMode
  );
  return { threads: enriched, hasMore };
}

async function loadMessagingThreads(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: { id: string; role: string },
  role: MessagingRole
): Promise<MessagingThread[]> {
  const page = await loadMessagingThreadsPage(
    supabase,
    profile,
    role,
    0,
    MESSAGING_THREADS_PAGE_SIZE
  );
  return page.threads;
}

async function assertThreadAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  threadId: string
): Promise<boolean> {
  const { data: thread, error } = await supabase
    .from("chat_threads")
    .select(`id, worker_id, company_profiles (employer_id)`)
    .eq("id", threadId)
    .single();

  if (error || !thread) return false;

  const cp = thread.company_profiles as
    | { employer_id: string }
    | { employer_id: string }[]
    | null;
  const employerId = Array.isArray(cp) ? cp[0]?.employer_id : cp?.employer_id;
  return thread.worker_id === userId || employerId === userId;
}

async function fetchMessagesPage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  threadId: string,
  limit: number,
  before?: string
): Promise<MessagingMessagesPage> {
  let query = supabase
    .from("chat_messages")
    .select(`*, sender:profiles (id, full_name, avatar_url, role)`)
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;
  if (error) {
    safeError("fetchMessagesPage:", error);
    return { messages: [], hasMore: false, nextCursor: null };
  }

  const rows = (data ?? []) as MessagingMessage[];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  // Newest-first from DB → chronological for UI
  const messages = page.reverse();
  const nextCursor = messages[0]?.created_at ?? null;

  return { messages, hasMore, nextCursor };
}

/** Fetch threads for worker (joins company_profiles) or employer (joins profiles). */
export async function getMessagingThreads(
  role: MessagingRole
): Promise<MessagingThread[]> {
  try {
    const ctx = await getAuthenticatedProfile();
    if (!ctx || ctx.profile.role !== role) return [];

    const { supabase, profile } = ctx;
    const cacheKey =
      role === "employer"
        ? CacheKeys.employerMessagingThreads(profile.id)
        : CacheKeys.workerMessagingThreads(profile.id);

    return getOrSet(cacheKey, CACHE_TTL_SECONDS.messagingThreads, () =>
      loadMessagingThreads(supabase, profile, role)
    );
  } catch (err) {
    safeError("getMessagingThreads:", err);
    return [];
  }
}

/** Paginated inbox page — used for infinite scroll beyond the cached first page. */
export async function getMessagingThreadsPage(
  role: MessagingRole,
  offset = 0,
  limit = MESSAGING_THREADS_PAGE_SIZE
): Promise<MessagingThreadsPage> {
  try {
    const parsed = loadMoreThreadsSchema.safeParse({ role, offset, limit });
    if (!parsed.success) return { threads: [], hasMore: false };

    const ctx = await getAuthenticatedProfile();
    if (!ctx || ctx.profile.role !== parsed.data.role) {
      return { threads: [], hasMore: false };
    }

    return loadMessagingThreadsPage(
      ctx.supabase,
      ctx.profile,
      parsed.data.role,
      parsed.data.offset,
      parsed.data.limit ?? MESSAGING_THREADS_PAGE_SIZE
    );
  } catch (err) {
    safeError("getMessagingThreadsPage:", err);
    return { threads: [], hasMore: false };
  }
}

/** Most recent messages for a thread (paginated). Older history via loadOlderMessagingMessages. */
export async function getMessagingMessages(
  threadId: string
): Promise<MessagingMessagesPage> {
  const empty: MessagingMessagesPage = {
    messages: [],
    hasMore: false,
    nextCursor: null,
  };
  try {
    const ctx = await getAuthenticatedProfile();
    if (!ctx) return empty;

    const parsed = threadIdSchema.safeParse({ threadId });
    if (!parsed.success) return empty;

    const { supabase, user } = ctx;
    const allowed = await assertThreadAccess(
      supabase,
      user.id,
      parsed.data.threadId
    );
    if (!allowed) return empty;

    return getOrSet(
      CacheKeys.messagingMessages(user.id, parsed.data.threadId),
      CACHE_TTL_SECONDS.messagingMessages,
      () =>
        fetchMessagesPage(
          supabase,
          parsed.data.threadId,
          MESSAGING_MESSAGES_PAGE_SIZE
        )
    );
  } catch (err) {
    safeError("getMessagingMessages:", err);
    return empty;
  }
}

/** Cursor-paginated older messages (not Redis-cached — ephemeral scroll history). */
export async function loadOlderMessagingMessages(
  threadId: string,
  before: string,
  limit = MESSAGING_MESSAGES_PAGE_SIZE
): Promise<MessagingMessagesPage> {
  const empty: MessagingMessagesPage = {
    messages: [],
    hasMore: false,
    nextCursor: null,
  };
  try {
    const parsed = loadOlderMessagesSchema.safeParse({ threadId, before, limit });
    if (!parsed.success) return empty;

    const ctx = await getAuthenticatedProfile();
    if (!ctx) return empty;

    const allowed = await assertThreadAccess(
      ctx.supabase,
      ctx.user.id,
      parsed.data.threadId
    );
    if (!allowed) return empty;

    return fetchMessagesPage(
      ctx.supabase,
      parsed.data.threadId,
      parsed.data.limit ?? MESSAGING_MESSAGES_PAGE_SIZE,
      parsed.data.before
    );
  } catch (err) {
    safeError("loadOlderMessagingMessages:", err);
    return empty;
  }
}

export async function sendMessagingMessage(
  threadId: string,
  content: string,
  basePath: string
): Promise<{ success: boolean; error?: string }> {
  const result = await runAction("sendMessagingMessage", async () => {
    const parsed = sendMessageSchema.parse({ threadId, content, basePath });
    const ctx = await getSession();
    if (!ctx) return fail("Unauthorized");

    const { supabase, user } = ctx;

    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select(`id, worker_id, blocked_reason, company_profiles (employer_id)`)
      .eq("id", parsed.threadId)
      .single();

    if (threadError || !thread) {
      return fail("Thread not found");
    }

    if (thread.blocked_reason) {
      return fail("Messaging is not available on this thread.");
    }

    const cp = thread.company_profiles as
      | { employer_id: string }
      | { employer_id: string }[]
      | null;
    const employerId = Array.isArray(cp) ? cp[0]?.employer_id : cp?.employer_id;
    if (thread.worker_id !== user.id && employerId !== user.id) {
      return fail("Access denied");
    }

    if (thread.worker_id === user.id && employerId) {
      const employerMessaged = await employerHasMessagedThread(
        supabase,
        parsed.threadId,
        employerId
      );
      if (!employerMessaged) {
        return fail("You can reply after the employer sends the first message.");
      }
    }

    if (employerId) {
      const messagingCheck = await assertEmployerMessaging(employerId);
      if (!messagingCheck.allowed) {
        return fail(messagingCheck.error);
      }
    }

    const { rateLimitMessaging } = await import("@/lib/server/rate-limit");
    const rateCheck = await rateLimitMessaging(user.id);
    if (!rateCheck.success) {
      return fail(rateCheck.error);
    }

    const { data: inserted, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: parsed.threadId,
        sender_id: user.id,
        content: parsed.content,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return fail("Failed to send message");
    }

    // Best-effort T&S auto-flag (fail-open; never blocks delivery).
    void import("@/lib/server/messaging/content-safety").then(
      ({ maybeFlagMessageForSafety }) =>
        maybeFlagMessageForSafety({
          threadId: parsed.threadId,
          messageId: inserted.id,
          content: parsed.content,
        })
    );

    await invalidateMessagingThreadMessages(user.id, parsed.threadId);
    if (employerId) {
      await invalidateEmployerMessagingCache(employerId);
      await invalidateWorkerMessagingCache(thread.worker_id);
    } else if (thread.worker_id === user.id) {
      await invalidateWorkerMessagingCache(user.id);
    }

    // Transactional email alerts (employer alerts are paid-tier gated inside the action).
    try {
      const { notifyWorkerNewMessage, notifyEmployerNewMessage } = await import(
        "@/actions/email"
      );
      if (employerId && user.id === employerId) {
        await notifyWorkerNewMessage({
          threadId: parsed.threadId,
          senderId: user.id,
          recipientId: thread.worker_id,
          messagePreview: parsed.content,
        });
      } else if (employerId && user.id === thread.worker_id) {
        await notifyEmployerNewMessage({
          threadId: parsed.threadId,
          senderId: user.id,
          recipientId: employerId,
          messagePreview: parsed.content,
        });
      }
    } catch (err) {
      safeError("sendMessagingMessage: email notify failed", err);
    }

    revalidatePath(parsed.basePath);
    return ok();
  });

  return result.success
    ? { success: true }
    : { success: false, error: result.error };
}

export async function markMessagingThreadRead(
  threadId: string,
  basePath: string
): Promise<{ success: boolean }> {
  const result = await runAction("markMessagingThreadRead", async () => {
    const parsed = threadActionSchema.parse({ threadId, basePath });
    const ctx = await getSession();
    if (!ctx) return fail("Unauthorized");

    const { supabase, user } = ctx;

    const { error } = await supabase
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("thread_id", parsed.threadId)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (error) {
      return fail("Failed to mark messages as read");
    }

    // Reset marked unread for the current user based on role — only write when
    // the flag is set so we avoid no-op chat_threads updates (and any
    // updated_at / realtime churn that would reshuffle the inbox).
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "worker") {
      await supabase
        .from("chat_threads")
        .update({ worker_marked_unread: false })
        .eq("id", parsed.threadId)
        .eq("worker_marked_unread", true);
    } else if (profile?.role === "employer") {
      await supabase
        .from("chat_threads")
        .update({ employer_marked_unread: false })
        .eq("id", parsed.threadId)
        .eq("employer_marked_unread", true);
    }

    const { data: thread } = await supabase
      .from("chat_threads")
      .select(`worker_id, company_profiles (employer_id)`)
      .eq("id", parsed.threadId)
      .maybeSingle();

    await invalidateMessagingThreadMessages(user.id, parsed.threadId);
    if (thread) {
      const cp = thread.company_profiles as
        | { employer_id: string }
        | { employer_id: string }[]
        | null;
      const employerId = Array.isArray(cp) ? cp[0]?.employer_id : cp?.employer_id;
      if (employerId) {
        await invalidateEmployerMessagingCache(employerId);
      }
      await invalidateWorkerMessagingCache(thread.worker_id);
    }

    revalidatePath(parsed.basePath);
    return ok();
  });

  return { success: result.success };
}

export async function toggleMessagingThreadPin(
  threadId: string,
  isPinned: boolean,
  basePath: string
): Promise<{ success: boolean }> {
  const result = await runAction("toggleMessagingThreadPin", async () => {
    const parsed = togglePinSchema.parse({ threadId, isPinned, basePath });
    const ctx = await getSession();
    if (!ctx) return fail("Unauthorized");

    const { supabase, user } = ctx;

    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select(`id, worker_id, company_profiles (employer_id)`)
      .eq("id", parsed.threadId)
      .single();

    if (threadError || !thread) {
      return fail("Thread not found");
    }

    const cp = thread.company_profiles as
      | { employer_id: string }
      | { employer_id: string }[]
      | null;
    const employerId = Array.isArray(cp) ? cp[0]?.employer_id : cp?.employer_id;
    if (thread.worker_id !== user.id && employerId !== user.id) {
      return fail("Access denied");
    }

    const { error } = await supabase
      .from("chat_threads")
      .update({ is_pinned: parsed.isPinned })
      .eq("id", parsed.threadId);

    if (error) {
      return fail("Failed to update pin state");
    }

    await invalidateMessagingThreadMessages(user.id, parsed.threadId);
    if (employerId) {
      await invalidateEmployerMessagingCache(employerId);
    }
    await invalidateWorkerMessagingCache(thread.worker_id);

    revalidatePath(parsed.basePath);
    return ok();
  });

  return { success: result.success };
}

export async function ensureMessagingThread(
  payload: unknown
): Promise<{ success: true; data: { threadId: string } } | { success: false; error: string }> {
  const result = await runAction("ensureMessagingThread", async () => {
    const parsed = ensureMessagingThreadSchema.parse(payload);
    const ctx = await getSession();
    if (!ctx) return fail("Unauthorized");

    const { supabase, user } = ctx;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "employer") {
      return fail("Only employers can start a conversation.");
    }

    if (!parsed.candidateId) {
      return fail("Candidate is required to start a conversation.");
    }

    const ensured = await ensureEmployerMessagingThread(
      supabase,
      profile.id,
      parsed.jobId,
      parsed.candidateId
    );

    if (!ensured.success || !ensured.data) {
      return ensured.success ? fail("Failed to start conversation.") : ensured;
    }

    await invalidateEmployerMessagingCache(profile.id);
    await invalidateWorkerMessagingCache(parsed.candidateId);

    revalidatePath("/employer/messages");
    return ok({ threadId: ensured.data.threadId });
  });

  return result.success && result.data
    ? { success: true, data: result.data }
    : {
        success: false,
        error:
          !result.success && "error" in result
            ? result.error
            : "Failed to start conversation.",
      };
}

/** Worker: thread is available only after the employer has sent the first message. */
export async function getWorkerApplicationMessaging(jobId: string): Promise<{
  threadId: string | null;
  employerHasMessaged: boolean;
} | null> {
  try {
    const ctx = await getAuthenticatedProfile();
    if (!ctx || ctx.profile.role !== "worker") return null;

    const { supabase, profile } = ctx;

    const { data: application } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("candidate_id", profile.id)
      .maybeSingle();

    if (!application) return null;

    const { data: thread } = await supabase
      .from("chat_threads")
      .select("id, company_profiles (employer_id)")
      .eq("worker_id", profile.id)
      .eq("job_id", jobId)
      .maybeSingle();

    if (!thread) {
      return { threadId: null, employerHasMessaged: false };
    }

    const cp = thread.company_profiles as
      | { employer_id: string }
      | { employer_id: string }[]
      | null;
    const employerId = Array.isArray(cp) ? cp[0]?.employer_id : cp?.employer_id;

    if (!employerId) {
      return { threadId: null, employerHasMessaged: false };
    }

    const employerHasMessaged = await employerHasMessagedThread(
      supabase,
      thread.id,
      employerId
    );

    return {
      threadId: employerHasMessaged ? thread.id : null,
      employerHasMessaged,
    };
  } catch (err) {
    safeError("getWorkerApplicationMessaging:", err);
    return null;
  }
}

/** Unique job roles from the user's active threads (jobs / job_posts via FK). */
export async function getMessagingJobRoles(
  role: MessagingRole
): Promise<MessagingJobRole[]> {
  const threads = await getMessagingThreads(role);
  return extractJobRolesFromThreads(threads);
}

export async function getUnreadMessagingCount(
  role: MessagingRole
): Promise<number> {
  try {
    const ctx = await getAuthenticatedProfile();
    if (!ctx || ctx.profile.role !== role) return 0;

    const { supabase, profile } = ctx;

    let threadIds: string[] = [];

    if (role === "worker") {
      const { data: threads } = await supabase
        .from("chat_threads")
        .select("id")
        .eq("worker_id", profile.id)
        .is("worker_deleted_at", null);
      threadIds = (threads ?? []).map((t) => t.id);
    } else {
      const { data: company } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("employer_id", profile.id)
        .maybeSingle();
      if (!company) return 0;
      const { data: threads } = await supabase
        .from("chat_threads")
        .select("id")
        .eq("company_profile_id", company.id)
        .is("employer_deleted_at", null);
      threadIds = (threads ?? []).map((t) => t.id);
    }

    if (threadIds.length === 0) return 0;

    const { count } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .in("thread_id", threadIds)
      .neq("sender_id", profile.id)
      .is("read_at", null);

    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function deleteConversation(
  threadId: string,
  basePath: string
): Promise<{ success: boolean; error?: string }> {
  const result = await runAction("deleteConversation", async () => {
    const parsed = threadActionSchema.parse({ threadId, basePath });
    const ctx = await getSession();
    if (!ctx) return fail("Unauthorized");

    const { supabase, user } = ctx;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile) return fail("Profile not found");

    let updateData = {};
    if (profile.role === "worker") {
      updateData = { worker_deleted_at: new Date().toISOString() };
    } else if (profile.role === "employer") {
      updateData = { employer_deleted_at: new Date().toISOString() };
    } else {
      return fail("Unsupported role");
    }

    const { error } = await supabase
      .from("chat_threads")
      .update(updateData)
      .eq("id", parsed.threadId);

    if (error) {
      return fail("Failed to delete conversation");
    }

    await invalidateMessagingThreadMessages(user.id, parsed.threadId);
    if (profile.role === "employer") {
      await invalidateEmployerMessagingCache(profile.id);
    } else {
      await invalidateWorkerMessagingCache(profile.id);
    }

    revalidatePath(parsed.basePath);
    return ok();
  });

  return result.success
    ? { success: true }
    : { success: false, error: result.error };
}

export async function toggleUnreadStatus(
  threadId: string,
  basePath: string
): Promise<{ success: boolean; error?: string }> {
  const result = await runAction("toggleUnreadStatus", async () => {
    const parsed = threadActionSchema.parse({ threadId, basePath });
    const ctx = await getSession();
    if (!ctx) return fail("Unauthorized");

    const { supabase, user } = ctx;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile) return fail("Profile not found");

    let updateData = {};
    if (profile.role === "worker") {
      updateData = { worker_marked_unread: true };
    } else if (profile.role === "employer") {
      updateData = { employer_marked_unread: true };
    } else {
      return fail("Unsupported role");
    }

    const { error } = await supabase
      .from("chat_threads")
      .update(updateData)
      .eq("id", parsed.threadId);

    if (error) {
      return fail("Failed to update unread status");
    }

    await invalidateMessagingThreadMessages(user.id, parsed.threadId);
    if (profile.role === "employer") {
      await invalidateEmployerMessagingCache(profile.id);
    } else {
      await invalidateWorkerMessagingCache(profile.id);
    }

    revalidatePath(parsed.basePath);
    return ok();
  });

  return result.success
    ? { success: true }
    : { success: false, error: result.error };
}
