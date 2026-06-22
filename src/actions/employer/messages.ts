"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { Conversation, Message } from "@/types/employer/messages";
import { revalidatePath } from "next/cache";

/**
 * Fetch all conversation threads for the logged-in employer.
 * Queries Supabase db tables and supports filtering threads by candidate role.
 */
export async function getConversations(roleFilter?: string): Promise<Conversation[]> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return [];
    }

    // Fetch conversation IDs where current user is a participant
    const { data: participations, error: partError } = await supabase
      .from("participants")
      .select("conversation_id")
      .eq("profile_id", profile.id);

    if (partError) {
      safeError("Error fetching participants:", partError);
      return [];
    }

    const conversationIds = participations?.map((p) => p.conversation_id) || [];
    const dbConversations: Conversation[] = [];

    if (conversationIds.length > 0) {
      // Query conversations, their participants, and last messages
      for (const convId of conversationIds) {
        // Get all participants for this conversation except the current user
        const { data: otherParticipants } = await supabase
          .from("participants")
          .select("profile_id, profiles(first_name, last_name, role, avatar_url)")
          .eq("conversation_id", convId)
          .neq("profile_id", profile.id);

        // Get last message in the conversation
        const { data: lastMessages } = await supabase
          .from("messages")
          .select("content, created_at, sender_id, read_at")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMsg = lastMessages?.[0];
        const participantNames = otherParticipants?.map(
          (p: any) => `${p.profiles?.first_name || ""} ${p.profiles?.last_name || ""}`.trim()
        ) || [];

        // Check if there are unread messages sent by other participants
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", convId)
          .neq("sender_id", profile.id)
          .is("read_at", null);

        // Map candidate roles or metadata from profiles
        const firstOther = otherParticipants?.[0]?.profiles as any;
        
        dbConversations.push({
          id: convId,
          participantNames,
          lastMessageSnippet: lastMsg?.content || null,
          updatedAt: lastMsg?.created_at || new Date().toISOString(),
          isUnread: (unreadCount || 0) > 0,
          candidateRole: firstOther?.role || "Developer",
          avatarUrl: firstOther?.avatar_url || null,
          pinned: false,
        });
      }
    }

    // Apply roleFilter if provided and not equal to "All Roles"
    if (roleFilter && roleFilter !== "All Roles") {
      return dbConversations.filter(
        (thread) => thread.candidateRole?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    return dbConversations;
  } catch (err) {
    safeError("getConversations error occurred:", err);
    return [];
  }
}

/**
 * Fetch messages for a specific conversation securely.
 * Checks session, confirms role, and implements strict IDOR participant validation.
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return [];
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return [];
    }

    // IDOR protection: Verify current user is a participant of the requested conversationId
    const { data: participant, error: partError } = await supabase
      .from("participants")
      .select("conversation_id")
      .eq("conversation_id", conversationId)
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (partError || !participant) {
      return [];
    }

    // Fetch database messages
    const { data: dbMessages, error: msgError } = await supabase
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        read_at,
        profiles(first_name, last_name, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgError) {
      safeError("Error fetching db messages:", msgError);
      return [];
    }

    // Mark unread messages as read (Update receipt)
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", profile.id)
      .is("read_at", null);

    return (dbMessages || []).map((msg: any) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
      status: msg.read_at ? "read" : "sent",
      senderName: `${msg.profiles?.first_name || ""} ${msg.profiles?.last_name || ""}`.trim(),
      senderAvatarUrl: msg.profiles?.avatar_url || null,
      readReceipt: !!msg.read_at,
    }));
  } catch (err) {
    safeError("getMessages error occurred:", err);
    return [];
  }
}

/**
 * Fetch total unread message threads count.
 */
export async function getUnreadMessageCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return 0;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "employer") {
      return 0;
    }

    // Check actual unread count from database
    const { data: participations } = await supabase
      .from("participants")
      .select("conversation_id")
      .eq("profile_id", profile.id);

    const conversationIds = participations?.map((p) => p.conversation_id) || [];
    let unreadCount = 0;

    if (conversationIds.length > 0) {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", profile.id)
        .is("read_at", null);

      unreadCount = count || 0;
    }

    return unreadCount;
  } catch (err) {
    safeError("getUnreadMessageCount error occurred:", err);
    return 0;
  }
}

/**
 * Sends a message in a conversation thread securely.
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ success?: boolean; message?: Message; error?: string }> {
  try {
    safeLog("[Auth] Send message Server Action initiated");

    if (!content.trim()) {
      return { error: "Message content cannot be empty." };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication failed. Please log in again." };
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return { error: "Access denied. Only employers can send messages in this portal." };
    }

    // IDOR protection: Verify current user participates in the conversation thread
    const { data: participant, error: partError } = await supabase
      .from("participants")
      .select("conversation_id")
      .eq("conversation_id", conversationId)
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (partError || !participant) {
      return { error: "Access denied. You are not a participant of this conversation." };
    }

    // Insert real message into database
    const { data: insertedMsg, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        content: content.trim(),
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        profiles(first_name, last_name, avatar_url)
      `)
      .single();

    if (insertError || !insertedMsg) {
      safeError("Error inserting message:", insertError);
      return { error: "Failed to save message to the database." };
    }

    const senderProfile = Array.isArray(insertedMsg.profiles)
      ? insertedMsg.profiles[0]
      : (insertedMsg.profiles as any);

    const message: Message = {
      id: insertedMsg.id,
      conversationId: insertedMsg.conversation_id,
      senderId: insertedMsg.sender_id,
      content: insertedMsg.content,
      createdAt: insertedMsg.created_at,
      status: "sent",
      senderName: `${senderProfile?.first_name || ""} ${senderProfile?.last_name || ""}`.trim(),
      senderAvatarUrl: senderProfile?.avatar_url || null,
      readReceipt: false,
    };

    revalidatePath("/messages");
    return { success: true, message };
  } catch (err) {
    safeError("sendMessage error occurred:", err);
    return { error: "An unexpected error occurred while sending the message. Please try again." };
  }
}
