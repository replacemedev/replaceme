"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { ChatThread, ChatMessage } from "@/types/messaging";
import { revalidatePath } from "next/cache";

/**
 * Fetch all chat threads for the logged-in worker, including joins with company profiles and jobs.
 */
export async function getWorkerThreads(): Promise<ChatThread[]> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      safeError("Auth error in getWorkerThreads:", authError);
      return [];
    }

    // Verify user is a worker
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "worker") {
      safeError("Profile error or unauthorized role in getWorkerThreads:", profileError);
      return [];
    }

    // Query threads with company_profiles and jobs joined
    const { data: threads, error: threadsError } = await supabase
      .from("chat_threads")
      .select(`
        *,
        company_profiles (
          id,
          company_name,
          logo_url,
          website_url
        ),
        jobs (
          id,
          title
        )
      `)
      .eq("worker_id", profile.id)
      .order("updated_at", { ascending: false });

    if (threadsError) {
      safeError("Error fetching worker chat threads:", threadsError);
      return [];
    }

    const formattedThreads: ChatThread[] = [];

    for (const t of (threads || [])) {
      // Get the last message in this thread
      const { data: lastMessages } = await supabase
        .from("chat_messages")
        .select("content, created_at, sender_id, read_at")
        .eq("thread_id", t.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMsg = lastMessages?.[0] || null;

      // Get count of unread messages sent by the employer (sender_id != current user)
      const { count: unreadCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("thread_id", t.id)
        .neq("sender_id", profile.id)
        .is("read_at", null);

      formattedThreads.push({
        ...t,
        company_profiles: t.company_profiles as any,
        jobs: t.jobs as any,
        last_message: lastMsg,
        unread_count: unreadCount || 0,
      });
    }

    return formattedThreads;
  } catch (err) {
    safeError("Unhandled error in getWorkerThreads Server Action:", err);
    return [];
  }
}

/**
 * Fetch all messages inside a specific thread.
 */
export async function getThreadMessages(threadId: string): Promise<ChatMessage[]> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Verify current user is worker or employer participant of the thread
    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select(`
        id,
        worker_id,
        company_profiles (
          employer_id
        )
      `)
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      safeError(`Error verifying thread access for ${threadId}:`, threadError);
      return [];
    }

    const employerId = (thread.company_profiles as any)?.employer_id;
    if (thread.worker_id !== user.id && employerId !== user.id) {
      safeError("Access denied to thread messages: user is not a participant.");
      return [];
    }

    // Fetch messages sorted chronologically
    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select(`
        *,
        sender:profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      safeError("Error fetching thread messages:", messagesError);
      return [];
    }

    return (messages || []) as ChatMessage[];
  } catch (err) {
    safeError("Unhandled error in getThreadMessages Server Action:", err);
    return [];
  }
}

/**
 * Send a new chat message within a thread.
 */
export async function sendWorkerMessage(threadId: string, content: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!content || content.trim() === "") {
      return { success: false, error: "Message content cannot be empty" };
    }

    // Verify access to thread
    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select(`
        id,
        worker_id,
        company_profiles (
          employer_id
        )
      `)
      .eq("id", threadId)
      .single();

    if (threadError || !thread) {
      return { success: false, error: "Thread not found or access denied" };
    }

    const employerId = (thread.company_profiles as any)?.employer_id;
    if (thread.worker_id !== user.id && employerId !== user.id) {
      return { success: false, error: "Access denied" };
    }

    // Insert new chat message
    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content: content.trim(),
      });

    if (insertError) {
      safeError("Error inserting chat message:", insertError);
      return { success: false, error: "Failed to send message" };
    }

    revalidatePath("/worker/messages");
    return { success: true };
  } catch (err) {
    safeError("Unhandled error in sendWorkerMessage Server Action:", err);
    return { success: false, error: "System error occurred" };
  }
}

/**
 * Mark all incoming messages in a thread as read.
 */
export async function markThreadAsRead(threadId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false };
    }

    // Update messages
    const { error: updateError } = await supabase
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("thread_id", threadId)
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (updateError) {
      safeError("Error marking thread messages as read:", updateError);
      return { success: false };
    }

    revalidatePath("/worker/messages");
    return { success: true };
  } catch (err) {
    safeError("Unhandled error in markThreadAsRead Server Action:", err);
    return { success: false };
  }
}

/**
 * Pin or unpin a thread.
 */
export async function togglePinThread(threadId: string, isPinned: boolean): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false };
    }

    const { error: updateError } = await supabase
      .from("chat_threads")
      .update({ is_pinned: isPinned })
      .eq("id", threadId)
      .eq("worker_id", user.id);

    if (updateError) {
      safeError("Error toggling pin on thread:", updateError);
      return { success: false };
    }

    revalidatePath("/worker/messages");
    return { success: true };
  } catch (err) {
    safeError("Unhandled error in togglePinThread Server Action:", err);
    return { success: false };
  }
}
