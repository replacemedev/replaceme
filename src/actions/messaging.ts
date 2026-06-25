"use server";

import { createClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { getSession } from "@/lib/server/auth/session";
import {
  sendMessageSchema,
  threadActionSchema,
  threadIdSchema,
  togglePinSchema,
} from "@/lib/validations/messaging";
import { safeError } from "@/utils/logger";
import {
  buildContextTitle,
  extractJobRolesFromThreads,
  MessagingJobRole,
  MessagingMessage,
  MessagingRole,
  MessagingThread,
} from "@/types/messaging";
import { revalidatePath } from "next/cache";

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

async function enrichThreads(
  supabase: Awaited<ReturnType<typeof createClient>>,
  threads: Array<Record<string, unknown>>,
  role: MessagingRole,
  currentUserId: string
): Promise<MessagingThread[]> {
  const result: MessagingThread[] = [];

  for (const t of threads) {
    const { data: lastMessages } = await supabase
      .from("chat_messages")
      .select("content, created_at, sender_id, read_at")
      .eq("thread_id", t.id as string)
      .order("created_at", { ascending: false })
      .limit(1);

    const { count: unreadCount } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("thread_id", t.id as string)
      .neq("sender_id", currentUserId)
      .is("read_at", null);

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
      };
      oppositeParty = {
        id: worker.id,
        name: worker.full_name?.trim() || "Worker",
        avatarUrl: worker.avatar_url,
      };
    }

    result.push({
      id: t.id as string,
      worker_id: t.worker_id as string,
      company_profile_id: t.company_profile_id as string,
      job_id: (t.job_id as string) ?? null,
      is_pinned: t.is_pinned as boolean,
      created_at: t.created_at as string,
      updated_at: t.updated_at as string,
      oppositeParty,
      jobTitle,
      contextTitle: buildContextTitle(jobTitle),
      last_message: lastMessages?.[0] ?? null,
      unread_count: unreadCount ?? 0,
    });
  }

  return result;
}

/** Fetch threads for worker (joins company_profiles) or employer (joins profiles). */
export async function getMessagingThreads(
  role: MessagingRole
): Promise<MessagingThread[]> {
  try {
    const ctx = await getAuthenticatedProfile();
    if (!ctx || ctx.profile.role !== role) return [];

    const { supabase, profile } = ctx;

    if (role === "worker") {
      const { data: threads, error } = await supabase
        .from("chat_threads")
        .select(
          `*, company_profiles (id, company_name, logo_url), jobs (id, title)`
        )
        .eq("worker_id", profile.id)
        .order("updated_at", { ascending: false });

      if (error) {
        safeError("getMessagingThreads worker:", error);
        return [];
      }
      return enrichThreads(supabase, threads ?? [], role, profile.id);
    }

    const { data: company } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("employer_id", profile.id)
      .single();

    if (!company) return [];

    const { data: threads, error } = await supabase
      .from("chat_threads")
      .select(
        `*, worker:profiles!chat_threads_worker_id_fkey (id, full_name, avatar_url), jobs (id, title)`
      )
      .eq("company_profile_id", company.id)
      .order("updated_at", { ascending: false });

    if (error) {
      safeError("getMessagingThreads employer:", error);
      return [];
    }
    return enrichThreads(supabase, threads ?? [], role, profile.id);
  } catch (err) {
    safeError("getMessagingThreads:", err);
    return [];
  }
}

export async function getMessagingMessages(
  threadId: string
): Promise<MessagingMessage[]> {
  try {
    const ctx = await getAuthenticatedProfile();
    if (!ctx) return [];

    const parsed = threadIdSchema.safeParse({ threadId });
    if (!parsed.success) return [];

    const { supabase, user } = ctx;

    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select(
        `id, worker_id, company_profiles (employer_id)`
      )
      .eq("id", parsed.data.threadId)
      .single();

    if (threadError || !thread) return [];

    const cp = thread.company_profiles as
      | { employer_id: string }
      | { employer_id: string }[]
      | null;
    const employerId = Array.isArray(cp) ? cp[0]?.employer_id : cp?.employer_id;
    if (thread.worker_id !== user.id && employerId !== user.id) return [];

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select(
        `*, sender:profiles (id, full_name, avatar_url, role)`
      )
      .eq("thread_id", parsed.data.threadId)
      .order("created_at", { ascending: true });

    if (error) {
      safeError("getMessagingMessages:", error);
      return [];
    }
    return (messages ?? []) as MessagingMessage[];
  } catch (err) {
    safeError("getMessagingMessages:", err);
    return [];
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

    const { error: insertError } = await supabase.from("chat_messages").insert({
      thread_id: parsed.threadId,
      sender_id: user.id,
      content: parsed.content,
    });

    if (insertError) {
      return fail("Failed to send message");
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

    revalidatePath(parsed.basePath);
    return ok();
  });

  return { success: result.success };
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

    const threads = await getMessagingThreads(role);
    return threads.reduce((sum, t) => sum + t.unread_count, 0);
  } catch {
    return 0;
  }
}
