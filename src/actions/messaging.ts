"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";
import {
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
      jobTitle: jobs?.title ?? null,
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

    const { supabase, user } = ctx;

    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select(
        `id, worker_id, company_profiles (employer_id)`
      )
      .eq("id", threadId)
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
      .eq("thread_id", threadId)
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
  try {
    const ctx = await getAuthenticatedProfile();
    if (!ctx) return { success: false, error: "Unauthorized" };

    const trimmed = content.trim();
    if (!trimmed) return { success: false, error: "Message cannot be empty" };

    const { supabase, user } = ctx;

    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select(`id, worker_id, company_profiles (employer_id)`)
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      return { success: false, error: "Thread not found" };
    }

    const cp = thread.company_profiles as
      | { employer_id: string }
      | { employer_id: string }[]
      | null;
    const employerId = Array.isArray(cp) ? cp[0]?.employer_id : cp?.employer_id;
    if (thread.worker_id !== user.id && employerId !== user.id) {
      return { success: false, error: "Access denied" };
    }

    const { error: insertError } = await supabase.from("chat_messages").insert({
      thread_id: threadId,
      sender_id: user.id,
      content: trimmed,
    });

    if (insertError) {
      safeError("sendMessagingMessage:", insertError);
      return { success: false, error: "Failed to send message" };
    }

    revalidatePath(basePath);
    return { success: true };
  } catch (err) {
    safeError("sendMessagingMessage:", err);
    return { success: false, error: "System error" };
  }
}

export async function markMessagingThreadRead(
  threadId: string,
  basePath: string
): Promise<{ success: boolean }> {
  try {
    const ctx = await getAuthenticatedProfile();
    if (!ctx) return { success: false };

    const { supabase, user } = ctx;

    const { error } = await supabase
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("thread_id", threadId)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (error) {
      safeError("markMessagingThreadRead:", error);
      return { success: false };
    }

    revalidatePath(basePath);
    return { success: true };
  } catch (err) {
    safeError("markMessagingThreadRead:", err);
    return { success: false };
  }
}

export async function toggleMessagingThreadPin(
  threadId: string,
  isPinned: boolean,
  basePath: string
): Promise<{ success: boolean }> {
  try {
    const ctx = await getAuthenticatedProfile();
    if (!ctx) return { success: false };

    const { supabase, user } = ctx;

    const { error } = await supabase
      .from("chat_threads")
      .update({ is_pinned: isPinned })
      .eq("id", threadId);

    if (error) {
      safeError("toggleMessagingThreadPin:", error);
      return { success: false };
    }

    revalidatePath(basePath);
    return { success: true };
  } catch (err) {
    safeError("toggleMessagingThreadPin:", err);
    return { success: false };
  }
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
